#!/usr/bin/env node

/**
 * SEO Verification Script
 * 
 * This script helps verify that documentation pages are server-rendered
 * by checking if content appears in the initial HTML response.
 * 
 * Usage:
 *   node scripts/verify-seo.js <url>
 * 
 * Example:
 *   node scripts/verify-seo.js http://localhost:3000/docs/design/README
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

const url = process.argv[2];

if (!url) {
  console.error('Usage: node scripts/verify-seo.js <url>');
  console.error('Example: node scripts/verify-seo.js http://localhost:3000/docs/design/README');
  process.exit(1);
}

function fetchHTML(urlString) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(urlString);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'SEO-Verification-Bot/1.0',
      },
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({ html: data, statusCode: res.statusCode, headers: res.headers });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

function checkSEO(html, url) {
  const checks = {
    hasTitle: /<title[^>]*>([^<]+)<\/title>/i.test(html),
    hasMetaDescription: /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i.test(html),
    hasOGTags: /<meta[^>]*property=["']og:/i.test(html),
    hasStructuredData: /<script[^>]*type=["']application\/ld\+json["']/i.test(html),
    hasContent: html.length > 5000, // Basic check - real content should be substantial
    hasH1: /<h1[^>]*>([^<]+)<\/h1>/i.test(html),
    hasParagraphs: /<p[^>]*>([^<]+)<\/p>/i.test(html),
    noLoadingState: !/<div[^>]*>Loading/i.test(html) && !/loading/i.test(html.toLowerCase()),
    noEmptyRoot: !/<div[^>]*id=["']root["'][^>]*>\s*<\/div>/i.test(html),
  };

  // Check for common client-side rendering markers
  const clientSideMarkers = {
    hasReactRoot: /<div[^>]*id=["']__next["']/i.test(html) || /<div[^>]*id=["']root["']/i.test(html),
    hasReactHydration: /data-reactroot/i.test(html),
    hasNextJS: /__NEXT_DATA__/i.test(html),
  };

  return { checks, clientSideMarkers };
}

async function main() {
  console.log(`\n🔍 Verifying SEO for: ${url}\n`);
  console.log('Fetching HTML...\n');

  try {
    const { html, statusCode, headers } = await fetchHTML(url);

    if (statusCode !== 200) {
      console.error(`❌ HTTP ${statusCode}: Failed to fetch page`);
      process.exit(1);
    }

    console.log(`✅ HTTP ${statusCode}: Page fetched successfully\n`);
    console.log(`📊 HTML Size: ${(html.length / 1024).toFixed(2)} KB\n`);

    const { checks, clientSideMarkers } = checkSEO(html, url);

    console.log('📋 SEO Checks:\n');
    console.log(`  Title Tag:        ${checks.hasTitle ? '✅' : '❌'}`);
    console.log(`  Meta Description: ${checks.hasMetaDescription ? '✅' : '❌'}`);
    console.log(`  Open Graph Tags:  ${checks.hasOGTags ? '✅' : '❌'}`);
    console.log(`  Structured Data:  ${checks.hasStructuredData ? '✅' : '❌'}`);
    console.log(`  Has Content:      ${checks.hasContent ? '✅' : '❌'}`);
    console.log(`  Has H1:           ${checks.hasH1 ? '✅' : '❌'}`);
    console.log(`  Has Paragraphs:   ${checks.hasParagraphs ? '✅' : '❌'}`);
    console.log(`  No Loading State: ${checks.noLoadingState ? '✅' : '❌'}`);
    console.log(`  Not Empty Root:    ${checks.noEmptyRoot ? '✅' : '❌'}\n`);

    console.log('🔧 Technical Details:\n');
    console.log(`  React Root:       ${clientSideMarkers.hasReactRoot ? '✅' : '❌'}`);
    console.log(`  Next.js Data:     ${clientSideMarkers.hasNextJS ? '✅' : '❌'}\n`);

    // Extract title if present
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) {
      console.log(`📄 Page Title: "${titleMatch[1]}"\n`);
    }

    // Extract meta description if present
    const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (descMatch) {
      console.log(`📝 Meta Description: "${descMatch[1]}"\n`);
    }

    // Count content indicators
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    const pCount = (html.match(/<p[^>]*>/gi) || []).length;
    const imgCount = (html.match(/<img[^>]*>/gi) || []).length;

    console.log('📈 Content Statistics:\n');
    console.log(`  H1 Headings: ${h1Count}`);
    console.log(`  Paragraphs: ${pCount}`);
    console.log(`  Images:      ${imgCount}\n`);

    // Overall assessment
    const passedChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.keys(checks).length;
    const score = (passedChecks / totalChecks) * 100;

    console.log(`\n🎯 SEO Score: ${score.toFixed(0)}% (${passedChecks}/${totalChecks} checks passed)\n`);

    if (score >= 80) {
      console.log('✅ Excellent! Your page is well-optimized for SEO.\n');
    } else if (score >= 60) {
      console.log('⚠️  Good, but there\'s room for improvement.\n');
    } else {
      console.log('❌ Your page needs SEO improvements.\n');
    }

    // Check for client-side only content
    if (!checks.hasContent || !checks.hasH1 || !checks.hasParagraphs) {
      console.log('⚠️  WARNING: Content may be loaded client-side only.\n');
      console.log('   Make sure you\'re using server-rendered routes.\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();


