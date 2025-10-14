import fs from 'fs/promises';
import path from 'path';
import prettier from 'prettier';

/**
 * Shared function to format taxonomy files with Prettier
 * Ensures consistent formatting across all taxonomy files
 */
export async function formatTaxonomyFile(
  taxonomies: any[],
  exportVariableName: string,
  headerComments: string[]
): Promise<string> {
  const timestamp = new Date().toISOString();
  const header = `// Generated on ${timestamp}
${headerComments.join('\n')}

`;

  // Generate unformatted content
  const unformattedContent = `${header}export const ${exportVariableName} = ${JSON.stringify(taxonomies, null, 2)};`;

  // Format with Prettier using explicit config matching .prettierrc
  try {
    const prettierConfigPath = path.join(process.cwd(), '.prettierrc');
    const configExists = await fs.access(prettierConfigPath).then(() => true).catch(() => false);

    let prettierConfig: prettier.Options;
    if (configExists) {
      const configContent = await fs.readFile(prettierConfigPath, 'utf-8');
      prettierConfig = JSON.parse(configContent);
      console.log('[TAXONOMY_FORMAT] Using Prettier config:', JSON.stringify(prettierConfig, null, 2));
    } else {
      // Fallback config matching project style
      prettierConfig = {
        parser: 'typescript',
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 2,
        semi: true,
      };
      console.log('[TAXONOMY_FORMAT] Using fallback Prettier config');
    }

    const formatted = await prettier.format(unformattedContent, {
      ...prettierConfig,
      parser: 'typescript',
    });
    console.log('[TAXONOMY_FORMAT] File formatted successfully with singleQuote:', prettierConfig.singleQuote);
    return formatted;
  } catch (error) {
    console.error('[TAXONOMY_FORMAT] Prettier formatting failed, using fallback:', error);
    // Fallback to manual formatting if Prettier fails
    const dataString = JSON.stringify(taxonomies, null, 2)
      .replace(/"([^"]+)":/g, '$1:')
      .replace(/"/g, "'");
    return `${header}export const ${exportVariableName} = ${dataString};\n`;
  }
}
