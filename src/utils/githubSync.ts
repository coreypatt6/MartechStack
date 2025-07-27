export class GitHubSync {
  private readonly GITHUB_API_BASE = 'https://api.github.com';
  private readonly REPO_OWNER = 'coreypatt6';
  private readonly REPO_NAME = 'MartechStack';
  private readonly FILE_PATH = 'data/vendors.json';
  private readonly BRANCH = 'main';

  // GitHub Personal Access Token
  private readonly GITHUB_TOKEN: string;

  constructor() {
    // Get token from environment variables
    this.GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN || '';
    console.log('🔧 GitHubSync initialized');
    console.log('🔐 Token status:', this.GITHUB_TOKEN ? '✅ Available' : '❌ Missing');
    console.log('🌍 Environment variables:', {
      VITE_GITHUB_TOKEN: import.meta.env.VITE_GITHUB_TOKEN ? 'SET' : 'NOT_SET',
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE
    });
    this.checkEnvironment();
  }

  private checkEnvironment() {
    if (typeof window !== 'undefined') {
      console.log('🌐 Browser environment detected');
      console.log('📁 Repository: https://github.com/' + this.REPO_OWNER + '/' + this.REPO_NAME);
      console.log('📄 Sync file: ' + this.FILE_PATH);
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
    const maxRetries = 5;
    let attempt = 0;
    let lastError: Error | null = null;

    // Check if we have authentication
    if (!this.GITHUB_TOKEN) {
      console.log('❌ GitHub sync failed: No authentication token');
      console.log('💡 To enable GitHub sync:');
      console.log('   1. Create GitHub Personal Access Token');
      console.log('   2. Add VITE_GITHUB_TOKEN=your_token to .env.local');
      console.log('   3. Restart dev server');
      throw new Error('GitHub token required for sync');
    }

    console.log('📊 Starting GitHub sync for', vendors.length, 'vendors');

    while (attempt < maxRetries) {
      attempt++;
      console.log(`🚀 GitHub sync attempt ${attempt}/${maxRetries}...`);

      try {
        // Always get fresh SHA for each attempt
        let sha: string | undefined;
        let fileExists = false;
        
        try {
          const currentFile = await this.getCurrentFile();
          sha = currentFile.sha;
          fileExists = true;
          console.log('📄 Found existing file with SHA:', sha.substring(0, 8) + '...');
        } catch (error) {
          console.log('📝 File does not exist yet, will create new file');
          fileExists = false;
        }

        // Prepare the content
        const content = {
          vendors,
          lastUpdated: new Date().toISOString(),
          version: '1.0.0',
          syncedFrom: 'MarTech Stack Dashboard',
          totalVendors: vendors.length,
          syncAttempt: attempt
        };

        const encodedContent = btoa(JSON.stringify(content, null, 2));

        // Prepare the commit data
        const commitData: any = {
          message: `🔄 Sync vendor data: ${vendors.length} vendors (attempt ${attempt})`,
          content: encodedContent,
          branch: this.BRANCH
        };

        // Only include SHA if file exists
        if (fileExists && sha) {
          commitData.sha = sha;
        }

        console.log('🚀 Making GitHub API request with', fileExists ? 'existing SHA' : 'new file');
        
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
          const errorData = await response.json().catch(() => ({}));
          
          // Handle 409 Conflict - file has been modified
          if (response.status === 409) {
            console.log(`⚠️ Conflict detected (attempt ${attempt}/${maxRetries}): ${errorData.message || 'File SHA mismatch'}`);
            
            if (attempt < maxRetries) {
              const delay = Math.min(1000 * attempt, 5000); // Exponential backoff, max 5s
              console.log(`🔄 Retrying with fresh SHA in ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue; // Retry the loop
            }
          }
          
          // Handle other errors
          console.error('❌ GitHub API error:', response.status, response.statusText, errorData);
          
          if (response.status === 404) {
            console.log('💡 Repository or file not found. Check repository exists and token has write permissions.');
          }
          
          lastError = new Error(`GitHub API error: ${response.status} - ${errorData.message || response.statusText}`);
          
          // Don't retry non-409 errors
          if (response.status !== 409) {
            throw lastError;
          }
          
          continue; // Retry for 409 errors
        }

        // Success!
        const result = await response.json();
        console.log('✅ Successfully saved vendors to GitHub!');
        console.log('📊 Commit details:', {
          sha: result.commit?.sha?.substring(0, 8) + '...',
          url: result.content?.html_url,
          size: result.content?.size + ' bytes',
          attempt: attempt
        });
        console.log('🔗 View your data: https://github.com/' + this.REPO_OWNER + '/' + this.REPO_NAME + '/blob/main/' + this.FILE_PATH);
        
        return; // Success - exit the retry loop

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`❌ Attempt ${attempt} failed:`, lastError.message);
        
        // Don't retry non-409 errors
        if (!lastError.message.includes('409') && !lastError.message.includes('conflict')) {
          throw lastError;
        }
        
        // If this was the last attempt, throw the error
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying
        const delay = Math.min(1000 * attempt, 5000);
        console.log(`⏳ Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // If we get here, all retries failed
    console.error('❌ All GitHub sync attempts failed');
    throw lastError || new Error('GitHub sync failed after all retries');
  }

  async loadVendors(): Promise<any[] | null> {
    try {
      // Check if we have authentication for private repos
      if (!this.GITHUB_TOKEN) {
        console.log('⚠️ GitHub token not available - using local storage only');
        return null;
      }

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
          console.log('📄 Vendor data file not found in GitHub');
          console.log('💡 This is normal for first-time setup or if repository is private');
          return null;
        }
        if (response.status === 403) {
          console.log('🔒 Access denied to GitHub repository');
          console.log('💡 Repository may be private or token lacks permissions');
          return null;
        }
        console.error('❌ GitHub API error while loading:', response.status, response.statusText);
        return null; // Don't throw, just return null to use local storage
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
      console.log('💡 Falling back to local storage');
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