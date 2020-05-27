const { Pool } = require('pg');
const pool = new Pool();

const SCHEDULE_TABLE_CREATE = `create table schedule (day date primary key,
                                                      quota integer not null,
                                                      allowedusers text[],
                                                      acceptedusers )
`;
