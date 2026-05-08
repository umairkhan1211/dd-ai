import { IProtocol } from '../models/Protocol';
import logger from '../utils/logger';

export interface ProtocolExecutionData {
  protocolId: string;
  inputs?: Record<string, string | number | boolean>;
  modifiers?: Record<string, string | number | boolean>;
  metadata?: Record<string, unknown>;
}

export interface ProtocolExecutionResult {
  finalPrompt: string;
  metadata: Record<string, unknown>;
  executionType: 'static' | 'semi-dynamic' | 'compositional';
  level: 1 | 2 | 3;
}

class ProtocolExecutionService {
  /**
   * Executes a protocol and returns the final prompt with metadata
   * @param protocol The protocol to execute
   * @param executionData The execution data including inputs and modifiers
   * @returns The execution result with final prompt and metadata
   */
  async executeProtocol(
    protocol: IProtocol, 
    executionData: ProtocolExecutionData
  ): Promise<ProtocolExecutionResult> {
    try {
      const { inputs = {}, modifiers = {}, metadata = {} } = executionData;

      let finalPrompt: string;
      const executionMetadata: Record<string, unknown> = {
        protocolId: protocol.id,
        protocolName: protocol.name,
        level: protocol.level,
        type: protocol.type,
        category: protocol.category,
        deliveredBy: protocol.deliveredBy,
        executedAt: new Date().toISOString(),
        ...metadata
      };

      switch (protocol.level) {
        case 1:
          finalPrompt = this.executeLevel1Protocol(protocol);
          break;
        case 2:
          finalPrompt = this.executeLevel2Protocol(protocol, inputs, modifiers);
          executionMetadata.inputs = inputs;
          executionMetadata.modifiers = modifiers;
          break;
        case 3:
          finalPrompt = this.executeLevel3Protocol(protocol, inputs, modifiers);
          executionMetadata.inputs = inputs;
          executionMetadata.modifiers = modifiers;
          executionMetadata.logic = protocol.logic;
          break;
        default:
          throw new Error(`Unsupported protocol level: ${protocol.level}`);
      }

      return {
        finalPrompt,
        metadata: executionMetadata,
        executionType: protocol.type,
        level: protocol.level
      };
    } catch (error) {
      logger.error('Error executing protocol:', error);
      throw new Error(`Failed to execute protocol: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Executes a Level 1 (Static) protocol
   * @param protocol The protocol to execute
   * @returns The static prompt template
   */
  private executeLevel1Protocol(protocol: IProtocol): string {
    return protocol.promptTemplate;
  }

  /**
   * Executes a Level 2 (Semi-Dynamic) protocol
   * @param protocol The protocol to execute
   * @param inputs User inputs
   * @param modifiers User modifiers
   * @returns The interpolated prompt
   */
  private executeLevel2Protocol(
    protocol: IProtocol, 
    inputs: Record<string, string | number | boolean>,
    modifiers: Record<string, string | number | boolean>
  ): string {
    return this.interpolateTemplate(protocol.promptTemplate, inputs, modifiers);
  }

  /**
   * Executes a Level 3 (Compositional) protocol
   * @param protocol The protocol to execute
   * @param inputs User inputs
   * @param modifiers User modifiers
   * @returns The interpolated prompt with logic applied
   */
  private executeLevel3Protocol(
    protocol: IProtocol, 
    inputs: Record<string, string | number | boolean>,
    modifiers: Record<string, string | number | boolean>
  ): string {
    let basePrompt = this.interpolateTemplate(protocol.promptTemplate, inputs, modifiers);

    // Apply conditional logic if present
    if (protocol.logic?.conditions) {
      basePrompt = this.applyConditionalLogic(basePrompt, protocol.logic.conditions, inputs, modifiers);
    }

    // Handle chaining - execute each step with its specific prompt template
    if (protocol.logic?.chaining?.enabled && protocol.logic.chaining.steps) {
      basePrompt = this.executeChainedSteps(protocol.logic.chaining.steps, inputs, modifiers, basePrompt);
    }

    // Add iteration context if enabled (works for both chained and non-chained protocols)
    if (protocol.logic?.iterations?.enabled) {
      const iterationContext = this.generateIterationContext(protocol.logic.iterations);
      basePrompt = `${basePrompt}\n\n${iterationContext}`;
    }

    return basePrompt;
  }

  /**
   * Interpolates template placeholders with actual values
   * @param template The template string with placeholders
   * @param inputs Input values
   * @param modifiers Modifier values
   * @returns The interpolated string
   */
  private interpolateTemplate(
    template: string,
    inputs: Record<string, string | number | boolean>,
    modifiers: Record<string, string | number | boolean>
  ): string {
    let result = template;

    // Replace input placeholders
    Object.entries(inputs).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
    });

    // Replace modifier placeholders
    Object.entries(modifiers).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), String(value));
    });

    return result;
  }

  /**
   * Applies conditional logic to the prompt
   * @param prompt The base prompt
   * @param conditions The conditions to apply
   * @param inputs Input values
   * @param modifiers Modifier values
   * @returns The modified prompt
   */
  private applyConditionalLogic(
    prompt: string,
    conditions: NonNullable<IProtocol['logic']>['conditions'],
    inputs: Record<string, string | number | boolean>,
    modifiers: Record<string, string | number | boolean>
  ): string {
    if (!conditions) return prompt;

    const allValues = { ...inputs, ...modifiers };
    let modifiedPrompt = prompt;

    for (const condition of conditions) {
      const fieldValue = allValues[condition.field];
      let conditionMet = false;

      switch (condition.operator) {
        case 'equals':
          conditionMet = fieldValue === condition.value;
          break;
        case 'not_equals':
          conditionMet = fieldValue !== condition.value;
          break;
        case 'contains':
          conditionMet = String(fieldValue).includes(String(condition.value));
          break;
        case 'greater_than':
          conditionMet = Number(fieldValue) > Number(condition.value);
          break;
        case 'less_than':
          conditionMet = Number(fieldValue) < Number(condition.value);
          break;
      }

      if (conditionMet) {
        modifiedPrompt += `\n\nAdditional instruction: ${condition.action}`;
      }
    }

    return modifiedPrompt;
  }

  /**
   * Generates iteration context for the prompt
   * @param iterations The iteration configuration
   * @returns The iteration context string
   */
  private generateIterationContext(iterations: NonNullable<IProtocol['logic']>['iterations']): string {
    if (!iterations) return '';

    const maxIterations = iterations.maxIterations || 3;
    let iterationText = `\n\nIMPORTANT: Iterate over the above instructions ${maxIterations} times. `;
    
    if (iterations.showProgress) {
      iterationText += `For each iteration, show your progressive improvements and refinements. `;
      iterationText += `Clearly label each iteration (Iteration 1, Iteration 2, etc.) and explain what you're improving in each pass.`;
    } else {
      iterationText += `Perform ${maxIterations} passes through the instructions, refining and improving your response with each iteration. `;
      iterationText += `Provide your final, most refined result after completing all ${maxIterations} iterations.`;
    }

    return iterationText;
  }

  /**
   * Generates chaining context for the prompt
   * @param steps The chaining steps
   * @returns The chaining context string
   */
  private generateChainingContext(steps: NonNullable<NonNullable<IProtocol['logic']>['chaining']>['steps']): string {
    if (!steps || steps.length === 0) return '';

    const stepNames = steps.map(step => step.name).join(' → ');
    return `This is part of a chained protocol with the following steps: ${stepNames}. Focus on this specific step while being aware of the overall workflow.`;
  }

  /**
   * Executes chained steps by combining all step prompts into a comprehensive prompt
   * @param steps The chaining steps
   * @param inputs Input values
   * @param modifiers Modifier values
   * @param basePrompt The base protocol prompt
   * @returns The combined prompt for all steps
   */
  private executeChainedSteps(
    steps: NonNullable<NonNullable<IProtocol['logic']>['chaining']>['steps'],
    inputs: Record<string, string | number | boolean>,
    modifiers: Record<string, string | number | boolean>,
    basePrompt: string
  ): string {
    if (!steps || steps.length === 0) return basePrompt;

    // Start with the base prompt
    let combinedPrompt = basePrompt;
    
    // Add each step as a specific instruction
    combinedPrompt += '\n\nExecute the following steps in sequence:\n';
    
    steps.forEach((step, index) => {
      const stepNumber = index + 1;
      const interpolatedStepPrompt = this.interpolateTemplate(step.promptTemplate, inputs, modifiers);
      
      combinedPrompt += `\n${stepNumber}. ${step.name}: ${interpolatedStepPrompt}`;
    });
    
    // Add final instruction
    combinedPrompt += '\n\nProvide a comprehensive response that addresses all steps above in a single, cohesive output.';
    
    return combinedPrompt;
  }

  /**
   * Validates protocol execution data
   * @param protocol The protocol to validate against
   * @param executionData The execution data to validate
   * @returns True if valid, throws error if invalid
   */
  validateExecutionData(protocol: IProtocol, executionData: ProtocolExecutionData): boolean {
    const { inputs = {}, modifiers = {} } = executionData;

    // Validate required inputs
    if (protocol.inputs) {
      for (const inputDef of protocol.inputs) {
        if (inputDef.required && (!inputs[inputDef.name] || inputs[inputDef.name] === '')) {
          throw new Error(`Required input '${inputDef.label}' is missing or empty.`);
        }
      }
    }

    // Validate input types
    if (protocol.inputs) {
      for (const inputDef of protocol.inputs) {
        const value = inputs[inputDef.name];
        if (value !== undefined && value !== null && value !== '') {
          switch (inputDef.type) {
            case 'number':
              if (isNaN(Number(value))) {
                throw new Error(`Input '${inputDef.label}' must be a number.`);
              }
              break;
            case 'boolean':
              if (typeof value !== 'boolean') {
                throw new Error(`Input '${inputDef.label}' must be a boolean.`);
              }
              break;
            case 'select':
              if (inputDef.options && !inputDef.options.includes(String(value))) {
                throw new Error(`Input '${inputDef.label}' must be one of: ${inputDef.options.join(', ')}.`);
              }
              break;
          }
        }
      }
    }

    return true;
  }
}

export default new ProtocolExecutionService(); 