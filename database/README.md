# Database Layer

This folder contains the persistence-specific parts of the BytesAndBeyond workspace that are shared by the backend runtime:

- `config/` - connection and database bootstrap utilities
- `seeders/` - sample data and development seed scripts
- `backups/` - reserved location for local database exports or snapshots

The application uses MongoDB through Mongoose models that remain in `backend/src/models` because they are consumed directly by API controllers and services.
