import templateService from '../template.service';
import logger from '../../utils/logger';
import { ICastMember } from '../../models/Cast';
import { IProtocol } from '../../models/Protocol';



export interface SystemPromptOptions {
  operatorProfile?: string | Record<string, unknown>;
  castMembers?: ICastMember[];
}

export class SystemPromptService {
  private initialised = false;

  async init(): Promise<void> {
    try {
      if (!templateService.listTemplates().includes('system.njk')) {
        throw new Error(
          'Default template deviation-engine.njk not found. Please add it or pass template_name explicitly.'
        );
      }
      this.initialised = true;
      logger.info('SystemPromptService initialised');
    } catch (err) {
      logger.error('Failed to initialise SystemPromptService:', err);
      throw err;
    }
  }

  /**
   * Render a system prompt using Nunjucks templates
   */
  generateSystemPrompt(
    template_name = 'system.njk',
    options: SystemPromptOptions = {}
  ): string {
    if (!this.initialised) {
      logger.warn('SystemPromptService used before init() completed.');
    }

    const {
      operatorProfile = '{}',
      castMembers = [],
    } = options;

    try {
      const templateContext = {
        operatorProfile,
        castMembers,
      };

      return templateService.render(template_name, templateContext);
    } catch (err) {
      logger.error('Error generating system prompt:', err);
      return '';
    }
  }

  /**
   * List available .njk templates
   */
  listTemplates(): string[] {
    try {
      return templateService
        .listTemplates()
        .filter((t) => t.endsWith('.njk'));
    } catch (err) {
      logger.error('Error listing templates:', err);
      return [];
    }
  }
}

export const systemPromptService = new SystemPromptService();
export default systemPromptService;
