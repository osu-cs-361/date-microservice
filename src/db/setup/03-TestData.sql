INSERT INTO User (email, token) VALUES ("test_user01@testmail.com", "abc123");
INSERT INTO User (email, token) VALUES ("test_user02@testmail.com", "quickbrownfox");
INSERT INTO User (email, token) VALUES ("test_user03@testmail.com", "arrakis");

INSERT INTO Event (name, start, end, user_id) 
VALUES (
    "The 21st Night of September",
    "2021-09-21 07:00:00.000",
    "2021-09-21 09:00:00.000",
    (SELECT id FROM User WHERE email="test_user01@testmail.com")
);

INSERT INTO Event (name, start, end, user_id) 
VALUES (
    "Change minds of pretenders",
    "2020-09-21 22:00:00",
    "2020-09-21 23:59:59",
    (SELECT id FROM User WHERE email="test_user02@testmail.com")
);

INSERT INTO Event (name, start, end, user_id) 
VALUES (
    "Chase clouds away",
    "2021-09-21 07:00:00.000",
    "2021-09-22 09:00:00.000",
    (SELECT id FROM User WHERE email="test_user03@testmail.com")
);