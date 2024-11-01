CREATE TABLE IF NOT EXISTS Usuario(
	id_user INT PRIMARY KEY,
	login VARCHAR(255) NOT NULL UNIQUE,
	senha VARCHAR(255)
);

CREATE SEQUENCE IF NOT EXISTS user_seq
	AS INT
	INCREMENT BY 1
	START WITH 1
	MINVALUE 1
	NO MAXVALUE
	NO CYCLE
	OWNED BY Usuario.id_user;
;

ALTER TABLE Usuario
ALTER COLUMN id_user SET DEFAULT nextval('user_seq');

select * from Usuario

CREATE TABLE IF NOT EXISTS UsuarioImagem (
    id_imagem SERIAL PRIMARY KEY,
    id_user INT REFERENCES Usuario(id_user) ON DELETE CASCADE,
    imagem BYTEA NOT NULL,
	tipo_imagem VARCHAR(10),
    data_upload TIMESTAMP DEFAULT NOW()
);
