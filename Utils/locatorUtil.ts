// utils/locatorUtil.ts
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
});

export function loadAllLocators(xmlFilePath: string): Record<string, string> {
  try {
    const xml = fs.readFileSync(xmlFilePath, 'utf-8');
    const parsed = parser.parse(xml);

    const controls = parsed.objectstore?.control;
    if (!controls) {
      console.warn(`No <control> found in XML at ${xmlFilePath}`);
      return {};
    }

    const controlList = Array.isArray(controls) ? controls : [controls];
    const locatorMap: Record<string, string> = {};

    for (const ctrl of controlList) {
      const key = ctrl.key;
      const record = Array.isArray(ctrl.searchrecords?.searchrecord)
        ? ctrl.searchrecords.searchrecord[0]
        : ctrl.searchrecords?.searchrecord;

      if (!key || !record || !record.method || !record['#text']) {
        console.warn(`Skipping invalid control: ${key || 'unknown'}`);
        continue;
      }

      try {
        const selector = buildSelector(record);
        
        // Filter out problematic locators
        if (selector.includes("translate(@id)")) {
          console.warn(`Skipping problematic locator for key: ${key}`);
          continue;
        }
        
        locatorMap[key] = selector;
       // console.log(`✅ Loaded locator: ${key} = ${selector}`);
        
      } catch (error) {
        console.warn(`Failed to build selector for key: ${key}, error: ${error}`);
        continue;
      }
    }

    console.log(`✅ Loaded ${Object.keys(locatorMap).length} locators from ${path.basename(xmlFilePath)}`);
    return locatorMap;
    
  } catch (error) {
    console.error(`❌ Failed to load locators from ${xmlFilePath}:`, error);
    return {};
  }
}

function buildSelector(record: any): string {
  const method = record.method.toLowerCase();
  const value = record['#text'];

  if (!value || typeof value !== 'string') {
    throw new Error(`Invalid selector value: ${value}`);
  }

  switch (method) {
    case 'id':
      return `#${value}`;
      
    case 'id_display':
      // Handle id_display - treat similar to id but may need special handling
      return `#${value}`;
      
    case 'class':
      return '.' + value.trim().split(/\s+/).join('.');
      
    case 'xpath':
    case 'xpath_display':
      return `xpath=${value}`;
      
    case 'css':
      return value;
      
    case 'name':
      return `[name="${value}"]`;
      
    case 'tag':
      return value;
      
    case 'text':
      return `text=${value}`;
      
    case 'link':
      return `a:has-text("${value}")`;
      
    case 'button':
      return `button:has-text("${value}")`;
      
    case 'role':
      return `role=${value}`;
      
    default:
      console.warn(`Unsupported locator method: ${method}, using as CSS selector`);
      return value; // Fallback to treating as CSS selector
  }
}