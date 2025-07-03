const DEFAULT_TABLE = "logs";

const TABLE_EXISTS = `
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = %L
  )
`;

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS %I (
    log_id SERIAL PRIMARY KEY,
    level VARCHAR(5) NOT NULL,
    message TEXT NOT NULL,
    hostname TEXT NOT NULL,
    process_id INT NOT NULL,
    time TIMESTAMPTZ NOT NULL,
    data JSON NULL
  )
`;

const INSERT_INTO = `
  INSERT INTO %I (level, message, hostname, process_id, time, data)
  VALUES ($1, $2, $3, $4, $5, $6)
`;

export { CREATE_TABLE, DEFAULT_TABLE, INSERT_INTO, TABLE_EXISTS };
