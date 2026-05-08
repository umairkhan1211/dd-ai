
      import { pipeline, env } from '@xenova/transformers';
      
      // Configure environment
      env.allowLocalModels = false;
      env.useBrowserCache = false;
      
      // Export the configured modules
      export { pipeline, env };
    