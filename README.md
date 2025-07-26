# MarTech Stack Dashboard

A comprehensive marketing technology stack visualization and vendor management dashboard built with React, TypeScript, and Tailwind CSS.

## Features

### 🎯 Interactive Dashboard
- **Dynamic Category Cards**: Auto-resizing cards that display all vendor logos with masonry-style layout
- **Vendor Visualization**: Clean, organized display of marketing technology vendors by category
- **Real-time Updates**: Live data synchronization across all components

### 🛠️ Admin Panel
- **Single Vendor Management**: Add, edit, and delete vendors with comprehensive form validation
- **Bulk Upload**: Excel-based bulk vendor import with data validation and error reporting
- **Logo Management**: Automatic logo fetching and manual upload capabilities
- **Cost Tracking**: Annual cost monitoring and renewal date management

### 📊 Categories
- Customer Data Platform (CDP)
- Paid & Data Collaboration
- Email & SMS Marketing
- Web Analytics & Optimization
- Social Media Publishing
- Social Media Listening
- Talent & Influencer Management
- PR & Communications
- Customer Service
- Marketing Analytics

### 💼 Vendor Management
- **Deployment Status**: Track Active, Pending, and Inactive vendors
- **Cost Analysis**: Monitor annual costs and renewal dates
- **Label System**: Organize vendors by business units (2K, Rockstar, Zynga, Ghost Story)
- **Multi-Category Support**: Vendors can belong to multiple categories
- **GitHub Cloud Sync**: Automatic synchronization of vendor data to GitHub repository

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth interactions
- **Forms**: React Hook Form with Yup validation
- **Data Management**: React Query for state management
- **Routing**: React Router DOM
- **File Processing**: XLSX for Excel import/export
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Cloud Storage**: GitHub API for cross-device vendor synchronization

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd martech-stack-dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Dashboard View
- Browse marketing technology categories in a masonry-style layout
- Click on any category card to view detailed vendor information
- View total costs, active vendors, and capabilities for each category

### Admin Panel
- Access via the "Admin" button in the top-right corner
- Add individual vendors using the comprehensive form
- Upload multiple vendors via Excel using the bulk upload feature
- Edit or delete existing vendors from the vendor list

### Bulk Upload
1. Download the Excel template from the admin panel
2. Fill in vendor information following the template format
3. Upload the completed Excel file
4. Review the data preview and validation results
5. Import valid vendors to the system

## Data Structure

### Vendor Object
```typescript
interface Vendor {
  id: string;
  name: string;
  logo: string;
  deploymentStatus: 'Active' | 'Pending' | 'Inactive';
  capabilities: string;
  label: ('2K' | 'Rockstar' | 'Zynga' | 'Ghost Story')[];
  annualCost: number;
  renewalDate: string;
  categories: string[];
}
```

### Category Object
```typescript
interface Category {
  id: string;
  name: string;
  icon: string;
  gradient: string;
  description: string;
  vendors: Vendor[];
}
```

## Features in Detail

### Dynamic Card Layout
- Cards automatically resize based on vendor count
- Masonry layout prevents uneven spacing
- Responsive design works across all screen sizes

### Logo Management
- Automatic logo fetching for known vendors
- Manual logo upload with preview
- Fallback placeholder system for failed logos
- Base64 encoding for persistent storage

### Data Validation
- Comprehensive form validation for all vendor fields
- Excel upload validation with detailed error reporting
- Duplicate detection and prevention
- Data type validation and sanitization

### Cost Analytics
- Annual cost tracking per vendor and category
- Renewal date monitoring
- Budget analysis across the entire MarTech stack

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.