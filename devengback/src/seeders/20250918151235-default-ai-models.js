'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Remove existing models first
    await queryInterface.bulkDelete('ai_models', {}, {});

    const models = [
      // BUDGET TIER (2-3 Ducks per message)
      {
        id: uuidv4(),
        name: 'gpt-3.5-turbo',
        display_name: 'GPT-3.5 Turbo',
        provider: 'openai',
        model_type: 'text',
        model_tier: 'budget',
        max_tokens: 16385,
        input_cost_per_token: 0.0000005,
        output_cost_per_token: 0.0000015,
        duck_cost_multiplier: 0.8,
        capabilities: JSON.stringify(['basic_chat', 'simple_coding']),
        tier_access: JSON.stringify(['trial', 'core', 'pro']),
        is_active: true,
        description: 'Budget-friendly option for simple tasks and basic conversations.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'claude-3-haiku-20240307',
        display_name: 'Claude 3 Haiku',
        provider: 'anthropic',
        model_type: 'text',
        model_tier: 'budget',
        max_tokens: 200000,
        input_cost_per_token: 0.0000005,
        output_cost_per_token: 0.0000015,
        duck_cost_multiplier: 0.8,
        capabilities: JSON.stringify(['text_chat', 'fast_response', 'long_context']),
        tier_access: JSON.stringify(['trial', 'core', 'pro']),
        is_active: true,
        description: 'Quick responses with excellent context understanding.',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // STANDARD TIER (4-5 Ducks per message)
      {
        id: uuidv4(),
        name: 'gpt-4o-mini',
        display_name: 'GPT-4o Mini',
        provider: 'openai',
        model_type: 'text',
        model_tier: 'standard',
        max_tokens: 128000,
        input_cost_per_token: 0.00000015,
        output_cost_per_token: 0.0000006,
        duck_cost_multiplier: 1.0,
        capabilities: JSON.stringify(['web_search', 'code_execution', 'reasoning']),
        tier_access: JSON.stringify(['core', 'pro']),
        is_active: true,
        description:
          'Fast and efficient model for most tasks. Great for everyday conversations and coding help.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'gemini-2.5-flash',
        display_name: 'Gemini 2.5 Flash',
        provider: 'google',
        model_type: 'multimodal',
        model_tier: 'standard',
        max_tokens: 1000000,
        input_cost_per_token: 0.00000015,
        output_cost_per_token: 0.0000006,
        duck_cost_multiplier: 1.0,
        capabilities: JSON.stringify([
          'text_chat',
          'image_analysis',
          'very_long_context',
          'document_processing',
        ]),
        tier_access: JSON.stringify(['core', 'pro']),
        is_active: true,
        description:
          'Google AI with massive 1M token context. Perfect for analyzing large documents.',
        created_at: new Date(),
        updated_at: new Date(),
      },

      // PREMIUM TIER (8-10 Ducks per message)
      {
        id: uuidv4(),
        name: 'gpt-4o',
        display_name: 'GPT-4o',
        provider: 'openai',
        model_type: 'multimodal',
        model_tier: 'premium',
        max_tokens: 128000,
        input_cost_per_token: 0.0000025,
        output_cost_per_token: 0.00001,
        duck_cost_multiplier: 1.5,
        capabilities: JSON.stringify([
          'web_search',
          'code_execution',
          'image_analysis',
          'vision',
          'advanced_reasoning',
        ]),
        tier_access: JSON.stringify(['pro']),
        is_active: true,
        description:
          'Most capable multimodal AI. Can analyze images, write complex code, and handle advanced reasoning.',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: uuidv4(),
        name: 'claude-sonnet-4-20250514',
        display_name: 'Claude Sonnet 4',
        provider: 'anthropic',
        model_type: 'text',
        model_tier: 'premium',
        max_tokens: 200000,
        input_cost_per_token: 0.000003,
        output_cost_per_token: 0.000015,
        duck_cost_multiplier: 1.8,
        capabilities: JSON.stringify([
          'advanced_reasoning',
          'complex_coding',
          'research_analysis',
          'long_context',
        ]),
        tier_access: JSON.stringify(['pro']),
        is_active: true,
        description:
          'Most advanced reasoning and analysis. Excellent for complex research, coding, and detailed explanations.',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert('ai_models', models);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete(
      'ai_models',
      {
        name: {
          [Sequelize.Op.in]: [
            'gpt-3.5-turbo',
            'claude-3-haiku-20240307',
            'gpt-4o-mini',
            'gemini-2.5-flash',
            'gpt-4o',
            'claude-sonnet-4-20250514',
          ],
        },
      },
      {}
    );
  },
};
