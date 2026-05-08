import * as nunjucks from 'nunjucks';
import * as fs from 'fs';
import * as path from 'path';
import logger from '../utils/logger';

/**
 * Service for rendering templates using Nunjucks (a Jinja2-like templating engine)
 */
export class TemplateService {
  private env: nunjucks.Environment;
  private templatesPath: string;
  private templateCache: Map<string, string> = new Map();

  constructor() {
    // Setup the base templates directory - fixed path
    this.templatesPath = path.resolve(process.cwd(), 'src/services/ai/prompts');
    
    // Create the directory if it doesn't exist
    if (!fs.existsSync(this.templatesPath)) {
      fs.mkdirSync(this.templatesPath, { recursive: true });
      logger.info(`Created templates directory: ${this.templatesPath}`);
    }
    
    // Configure Nunjucks environment
    this.env = nunjucks.configure(this.templatesPath, {
      autoescape: false,  // We want to allow HTML/markdown in our prompts
      trimBlocks: true,
      lstripBlocks: true,
      noCache: true,
    });
    
    this.addCustomFilters();
    
    logger.info('Template service initialized');
  }

  /**
   * Add custom filters to the Nunjucks environment
   */
  private addCustomFilters(): void {
    this.env.addFilter('truncate', (str: string, length: number = 100) => {
      if (str.length <= length) return str;
      return str.substring(0, length) + '...';
    });
    
    this.env.addFilter('formatDate', (date: Date | number | string) => {
      if (typeof date === 'number' || typeof date === 'string') {
        date = new Date(date);
      }
      return date.toISOString();
    });
    
    this.env.addFilter('join', (arr: any[], separator: string = ', ') => {
      if (!Array.isArray(arr)) return '';
      return arr.join(separator);
    });
  }

  /**
   * Render a template string with provided context
   */
  renderString(templateString: string, context: object = {}): string {
    try {
      return nunjucks.renderString(templateString, context);
    } catch (error) {
      logger.error('Error rendering template string:', error);
      throw new Error(`Failed to render template string: ${error}`);
    }
  }

  /**
   * Render a template file with provided context
   */
  render(templateName: string, context: object = {}): string {
    try {
      const fullPath = path.join(this.templatesPath, templateName);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Template file not found: ${templateName}`);
      }
      
      return this.env.render(templateName, context);
    } catch (error) {
      logger.error(`Error rendering template ${templateName}:`, error);
      throw new Error(`Failed to render template ${templateName}: ${error}`);
    }
  }

  /**
   * Load a template from file or cache
   */
  loadTemplate(templateName: string): string {
    if (this.templateCache.has(templateName)) {
      return this.templateCache.get(templateName)!;
    }
    
    try {
      const fullPath = path.join(this.templatesPath, templateName);
      
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Template file not found: ${templateName}`);
      }
      
      const templateContent = fs.readFileSync(fullPath, 'utf-8');
      
      if (process.env.NODE_ENV !== 'development') {
        this.templateCache.set(templateName, templateContent);
      }
      
      return templateContent;
    } catch (error) {
      logger.error(`Error loading template ${templateName}:`, error);
      throw new Error(`Failed to load template ${templateName}: ${error}`);
    }
  }

  /**
   * List all available templates
   */
  listTemplates(): string[] {
    try {
      const templates: string[] = [];
      
      const walkDir = (dir: string, baseDir: string = '') => {
        const files = fs.readdirSync(dir);
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          const relativePath = path.join(baseDir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            walkDir(filePath, relativePath);
          } else if (stat.isFile()) {
            templates.push(relativePath);
          }
        }
      };
      
      walkDir(this.templatesPath);
      return templates;
    } catch (error) {
      logger.error('Error listing templates:', error);
      throw new Error(`Failed to list templates: ${error}`);
    }
  }
}

export const templateService = new TemplateService();
export default templateService; 