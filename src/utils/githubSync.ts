export class GitHubSync {
  private readonly GITHUB_API_BASE = 'https://api.github.com';
  private readonly REPO_OWNER = 'coreypatt6';
  private readonly REPO_NAME = 'MartechStack';
  private readonly FILE_PATH = 'data/vendors.json';
  private readonly BRANCH = 'main';

  // GitHub Personal Access Token - In production, this should be in environment variables
  // For now, we'll use GitHub's public API with limitations
  private readonly GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';

  constructor() {
    // Check if we're in a GitHub Codespace (has built-in authentication)
    this.checkEnvironment();
  }

  private checkEnvironment() {
    if (typeof window !== 'undefined') {
      // Browser environment - limited to public repos or user-provided token
      console.log('GitHub Sync initialized for browser environment');
    }
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // Add authorization if token is available
    if (this.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${this.GITHUB_TOKEN}`;
    }

    return headers;
  }

  async saveVendors(vendors: any[]): Promise<void> {
    try {
      console.log('🔄 Starting GitHub sync for', vendors.length, 'vendors...');
      
      // First, try to get the current file to get its SHA (required for updates)
      let sha: string | undefined;
      
      try {
        const currentFile = await this.getCurrentFile();
        sha = currentFile.sha;
        console.log('📄 Found existing file with SHA:', sha.substring(0, 8) + '...');
      } catch (error) {
        // File doesn't exist yet, that's okay
        console.log('📝 File does not exist yet, will create new file');
      }

      // Prepare the content
      const content = {
        vendors,
        lastUpdated: new Date().toISOString(),
        version: '1.0.0',
        syncedFrom: 'MarTech Stack Dashboard',
        totalVendors: vendors.length
      };

      console.log('📦 Prepared content:', {
        vendorCount: content.totalVendors,
        lastUpdated: content.lastUpdated,
        hasExistingFile: !!sha
      });

      const encodedContent = btoa(JSON.stringify(content, null, 2));

      // Prepare the commit data
      const commitData = {
        message: `🔄 Sync vendor data: ${vendors.length} vendors (${new Date().toLocaleString()})`,
        content: encodedContent,
        branch: this.BRANCH,
        ...(sha && { sha }) // Include SHA if updating existing file
      };

      console.log('🚀 Making GitHub API request...');
      
      // Make the API call
      const response = await fetch(
        `${this.GITHUB_API_BASE}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents/${this.FILE_PATH}`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify(commitData)
        }
      );

      if (!response.ok) {
        console.error('❌ GitHub API error:', response.status, response.statusText);
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('✅ Successfully saved vendors to GitHub!');
      console.log('📊 Commit details:', {
        sha: result.commit?.sha?.substring(0, 8) + '...',
        url: result.content?.html_url,
        size: result.content?.size + ' bytes'
      });

    } catch (error) {
      console.error('❌ Error saving vendors to GitHub:', error);
      throw error;
    }
  }

  async loadVendors(): Promise<any[] | null> {
    try {
      console.log('📥 Loading vendors from GitHub...');
      
      const response = await fetch(
        `${this.GITHUB_API_BASE}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents/${this.FILE_PATH}?ref=${this.BRANCH}`,
        {
          method: 'GET',
          headers: this.getHeaders()
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          console.log('📄 Vendor data file not found in GitHub (first time setup)');
          return null;
        }
        console.error('❌ GitHub API error while loading:', response.status, response.statusText);
        throw new Error(`GitHub API error: ${response.status}`);
      }

      const fileData = await response.json();
      
      // Decode the base64 content
      const decodedContent = atob(fileData.content);
      const parsedData = JSON.parse(decodedContent);

      console.log('✅ Successfully loaded vendors from GitHub!');
      console.log('📊 Data details:', {
        vendorCount: parsedData.vendors?.length || 0,
        lastUpdated: parsedData.lastUpdated,
        version: parsedData.version,
        fileSize: fileData.size + ' bytes'
      });
      
      return parsedData.vendors || [];

    } catch (error) {
      console.error('❌ Error loading vendors from GitHub:', error);
      return null;
    }
  }

  private async getCurrentFile(): Promise<{ sha: string; content: string }> {
    const response = await fetch(
      `${this.GITHUB_API_BASE}/repos/${this.REPO_OWNER}/${this.REPO_NAME}/contents/${this.FILE_PATH}?ref=${this.BRANCH}`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    );

    if (!response.ok) {
      throw new Error(`File not found: ${response.status}`);
    }

    const fileData = await response.json();
    return {
      sha: fileData.sha,
      content: fileData.content
    };
  }

  // Method to check if GitHub sync is available
  isAvailable(): boolean {
    return !!this.GITHUB_TOKEN || this.isInCodespace();
  }

  private isInCodespace(): boolean {
    return typeof window !== 'undefined' && 
           (window.location.hostname.includes('github.dev') || 
            window.location.hostname.includes('codespaces'));
  }

  // Get sync status
  getStatus(): { available: boolean; authenticated: boolean; environment: string } {
    return {
      available: this.isAvailable(),
      authenticated: !!this.GITHUB_TOKEN,
      environment: this.isInCodespace() ? 'codespace' : 'browser'
    };
  }
}