# 🔥 Firecrawl MCP Setup Guide

This guide will help you connect Firecrawl MCP to Cursor for enhanced corporate logo fetching.

## ✅ Installation Complete

The following has been set up automatically:
- ✅ `firecrawl-mcp` package installed globally and locally
- ✅ MCP configuration files created
- ✅ Environment configuration set up
- ✅ Test script created

## 🔑 API Key Setup

**You need to complete this step manually:**

1. **Get Firecrawl API Key:**
   - Go to [firecrawl.dev](https://firecrawl.dev)
   - Sign up for an account
   - Navigate to your dashboard
   - Copy your API key

2. **Update Configuration:**
   - Open `.env.local` in your project
   - Replace `your_api_key_here` with your actual API key:
   ```bash
   FIRECRAWL_API_KEY=fc-your_actual_api_key_here
   ```

3. **Update MCP Configuration:**
   - The MCP config files are at:
     - `~/.cursor/mcp_servers.json` (global)
     - `./.cursor/mcp_servers.json` (project-specific)
   - Replace `your_api_key_here` with your actual API key in both files

## 🔄 Restart Cursor

**Important:** After setting up your API key, restart Cursor completely for the MCP integration to take effect.

## 🧪 Test Installation

Run this command to test if Firecrawl is working:

```bash
node test-firecrawl.js
```

You should see:
```
🔥 Testing Firecrawl installation...
✅ API key found
🚀 Testing Firecrawl connection...
✅ Firecrawl is working!
📄 Successfully scraped example.com
```

## 🤖 Using Firecrawl with Claude

Once set up, you can ask Claude in Cursor to use Firecrawl:

```
"Use Firecrawl to scrape the official logos from salesforce.com"
"Can you crawl hubspot.com and extract their brand assets?"
"Use Firecrawl to find logo URLs for these companies: [list]"
```

## 🛠️ Available MCP Tools

After setup, you'll have access to:
- `firecrawl_scrape` - Scrape individual web pages
- `firecrawl_crawl` - Crawl entire websites
- `firecrawl_search` - Search web content
- `firecrawl_map` - Map website structure

## 📁 Configuration Files Created

```
~/.cursor/mcp_servers.json          # Global MCP config
./.cursor/mcp_servers.json          # Project MCP config
./.env.local                        # Environment variables
./test-firecrawl.js                 # Test script
./FIRECRAWL_SETUP.md               # This guide
```

## 🐛 Troubleshooting

**MCP not working?**
- Ensure Cursor is completely restarted
- Check API key is correctly set in both `.env.local` and MCP config files
- Verify your Firecrawl account has credits

**Test script fails?**
- Check your API key is valid
- Ensure you have credits in your Firecrawl account
- Check network connectivity

## 🚀 Next Steps

1. Set your API key in `.env.local`
2. Update the MCP configuration files with your key
3. Restart Cursor
4. Test with: `node test-firecrawl.js`
5. Ask Claude to use Firecrawl for logo fetching!

---

Once set up, Firecrawl will provide much more powerful web scraping capabilities than the current system, allowing for better corporate logo extraction and content analysis.