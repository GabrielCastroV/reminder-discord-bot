const db = require('.');

const createUsersTable = async () => {
    db.prepare('DROP TABLE IF EXISTS users').run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
            discord_id TEXT PRIMARY KEY,
            name TEXT NOT NULL
        )
    `).run();
};

const createTables = async () => {
    await createUsersTable();
    console.log('Tablas de usuarios creadas');
    await createUsersNotes();
    console.log('Tabla de notas creadas');
    await createUsersReminders();
    console.log('Tabla de reminders creadas');
    console.log('Tablas creadas');
};

createTables();

const createUsersNotes = async () => {
    db.prepare('DROP TABLE IF EXISTS notes').run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS notes (
            note_id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NO NULL,
            description TEXT, 
            likes INTEGER DEFAULT 0,
            discord_id TEXT NO NULL,
            FOREIGN KEY (discord_id)
                REFERENCES users (discord_id)
                ON DELETE CASCADE
        )
    `).run();
};

const createUsersReminders = async () => {
    db.prepare('DROP TABLE IF EXISTS reminders').run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS reminders (
            reminder_id INTEGER PRIMARY KEY AUTOINCREMENT,
            hour TEXT NO NULL,
            minutes TEXT,
            day TEXT,
            month TEXT,
            year TEXT,
            description TEXT NO NULL,
            discord_id TEXT NO NULL,
            FOREIGN KEY (discord_id)
                REFERENCES users (discord_id)
                ON DELETE CASCADE
        )
    `).run();
};

