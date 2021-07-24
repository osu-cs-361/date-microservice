CREATE TABLE Event (
    id       INT PRIMARY KEY AUTO_INCREMENT,
    name     VARCHAR(255),
    start    DATETIME NOT NULL,
    end      DATETIME NOT NULL,
    user_id  INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES User (id)
);