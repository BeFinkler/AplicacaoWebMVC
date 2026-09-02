CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(160) NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    papel ENUM('organizador', 'participante') NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS eventos (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(140) NOT NULL,
    descricao TEXT NOT NULL,
    local VARCHAR(180) NOT NULL,
    inicio DATETIME NOT NULL,
    fim DATETIME NOT NULL,
    capacidade INT UNSIGNED NOT NULL,
    organizador_id BIGINT UNSIGNED NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_eventos_inicio (inicio),
    KEY idx_eventos_organizador (organizador_id),
    CONSTRAINT fk_eventos_organizador FOREIGN KEY (organizador_id)
        REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inscricoes (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    evento_id BIGINT UNSIGNED NOT NULL,
    participante_id BIGINT UNSIGNED NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_inscricoes_evento_participante (evento_id, participante_id),
    KEY idx_inscricoes_participante (participante_id),
    CONSTRAINT fk_inscricoes_evento FOREIGN KEY (evento_id)
        REFERENCES eventos (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_inscricoes_participante FOREIGN KEY (participante_id)
        REFERENCES usuarios (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sessoes (
    id VARCHAR(128) NOT NULL,
    dados LONGTEXT NOT NULL,
    expira_em DATETIME(3) NOT NULL,
    PRIMARY KEY (id),
    KEY idx_sessoes_expiracao (expira_em)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
