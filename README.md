# Global Food Waste Dashboard

A comprehensive data visualization application for analyzing and exploring global food waste statistics across different countries and regions.

![Dashboard Preview](./public/dashboard-preview.png)

## Overview

This interactive dashboard provides insights into food waste data from countries around the world, allowing users to:

- Explore food waste statistics by country and region
- Compare waste across different sectors (household, retail, food service)
- Analyze trends over time
- Visualize regional differences and patterns
- Export data for further analysis

The dashboard features an AI-powered chat assistant that helps users navigate the application and extract insights from the data through natural language queries.

## Features

- **Multiple Visualization Types**: Bar charts, pie charts, line graphs, and data tables
- **Interactive Filtering**: Filter by region, waste amount, and waste source type
- **Country Comparison**: Compare up to 8 countries side-by-side
- **Trend Analysis**: View how food waste has changed over time (simulated historical data)
- **Voice Navigation**: Control the dashboard using voice commands
- **AI Assistant**: Natural language interface for querying the data
- **Data Export**: Download data in CSV or PDF format
- **Responsive Design**: Works across desktop and mobile devices

## Technology Stack

- **Frontend**: Next.js 15 with React 18, TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Data Visualization**: Chart.js with react-chartjs-2
- **Voice Recognition**: Web Speech API
- **Markdown Rendering**: Marked
- **Export Functionality**: jsPDF, file-saver
- **Icons**: Lucide React, React Icons
- **UI Enhancements**: Sonner for toast notifications

## Getting Started

### Prerequisites

- Node.js 16.8+ or Bun 1.0+
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/food-waste-dashboard.git
   cd food-waste-dashboard