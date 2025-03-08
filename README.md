# Running Tracker Application

A web application for tracking running activities, built with React frontend and .NET 8 backend.

## Technology Stack

### Frontend
- React with TypeScript
- Modern UI components
- Responsive design for mobile and desktop

### Backend
- .NET 8 Web API
- Entity Framework Core
- SQL Server database

## Project Structure

- `RunningTracker.API` - .NET 8 Web API backend
- `RunningTracker.Client` - React frontend

## Features

- Track running activities (distance, time, date, etc.)
- View running history
- Analyze performance statistics
- User authentication and authorization

## Setup Instructions

### Prerequisites
- .NET 8 SDK
- Node.js and npm
- SQL Server

### Backend Setup
1. Navigate to the API directory:
   ```
   cd RunningTracker.API
   ```
2. Restore packages:
   ```
   dotnet restore
   ```
3. Update the connection string in `appsettings.json`
4. Apply migrations:
   ```
   dotnet ef database update
   ```
5. Run the API:
   ```
   dotnet run
   ```

### Frontend Setup
1. Navigate to the Client directory:
   ```
   cd RunningTracker.Client
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm start
   ```

## Development

The application uses Entity Framework Core for database operations and follows a RESTful API design pattern. The frontend communicates with the backend through HTTP requests. 