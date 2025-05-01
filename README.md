# Admin Portal - Lead Management System

A real-time lead management system that displays and manages leads from various sources.

## Features

- Real-time lead updates
- Multiple data source integration (Facebook, Instagram, LinkedIn, Website, Google)
- Lead statistics and analytics
- Responsive dashboard
- Automated lead generation simulation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/admin-portal.git
cd admin-portal
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
MONGODB_URI=mongodb://localhost:27017/admin_portal
PORT=3000
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Project Structure

```
admin-portal/
├── config/           # Configuration files
├── models/          # MongoDB models
├── public/          # Static files
├── scripts/         # Utility scripts
├── server.js        # Main application file
└── package.json     # Project dependencies
```

## Development

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run import` - Import leads from Excel file

## Deployment

The application can be deployed to:
- Vercel
- Render
- Railway
- Heroku

See deployment documentation for detailed instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License. 