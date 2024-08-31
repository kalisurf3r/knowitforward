# knowitforward

- clone git repo
- npm i 
- create the db by running `\i db/schema.sql` in your postgress prompt.
- set the .env file and populate the fields: `DB_NAME, DB_USER, DB_PW, JWT_SECRET`
- seed the data `npm run seed`
- to start the server: `npm run start` or `npm run watch`

## API calls

- register: `POST /api/user`
- login: `POST /api/login`
- get user details: `GET /api/user/:id`
- get active services: `GET /api/services`
- get services by service provider id: `GET /api/services/serviceprovider/:id`
- get services by customer id: `GET /api/services/customer/:id`
- get a service by id: `GET /api/services/:id`
- get all charities: `GET /api/charities`
- get all categories: `GET /api/categories`
- update status for a service: `PUT /api/services/:id`
- create a new service: `POST /api/service`
- [PENDING] get active services by different filter: `GET /api/services?category=Software`
- [PENDING] get user id from token: `GET /api/token`
- [PENDING] stripe webtoken: `POST /api/processpayment`

## Steps to make api calls
- first call login -- you can use a username pwd from the seed/auth.json file.
- capture the token string
- pass the token string in the request header as: ` {headers: {Authorization: <token>}}` (Google). **NOTE** Token is valid for 6h after which you need to generate a new one.
- pass the required data in request body
- invoke api 
- **NOTE** For future calls once logged in / register we need to get the token from storage. We either need to implement that or as an interim solution hardcode the token in the call and put a TODO there.


## request body for register
```
{
	"firstName": "Ross1",
    "lastName": "Geller1",
    "aboutMe": "As a passionate robotics teacher with over 10 years of experience, I am dedicated to inspiring the next generation of innovators. My teaching philosophy centers around hands-on learning, where students engage in real-world problem-solving through building and programming robots. With a background in mechanical engineering and computer science, I bring a deep understanding of both the theoretical and practical aspects of robotics. My goal is to foster creativity, critical thinking, and teamwork in my students, equipping them with the skills they need to excel in the rapidly evolving field of robotics.",
    "email": "rossgeller@gmail.com",
    "profession": "Robotics teacher",
    "profileImgUrl": "https://res.cloudinary.com/dwfvmcziw/image/upload/w_1000,ar_1:1,c_fill,g_auto,e_art:hokusai/v1720224090/samples/smile.jpg", 
	"username": "rg11",
	"password": "password"
}
```

## request body for login
```
{
		"username": "ank1",
		"password": "password"
}

```

## request body for PUT /api/services/:id
```
{
		"action": "Done"
}
```

## request body for POST /api/services
```
  {
    "title": "1hr Web Development Consultation",
    "description": "A one-hour consultation on web development best practices and strategies.",
    "basePrice": 100.0,
    "serviceDate": "2024-09-20T16:00:00Z",
    "charity": "Unicef",
    "category": "Software",
    "offerEndDate": "2024-09-15T23:59:59Z",
    "paymentLink": null,
		"ServiceProvideId": 8
  }

```

