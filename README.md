# backend project

- I will create complete fullstack project using react and node


## role for db connections

- always wrap in try catch block
- alternative to try catch block is to use asyncHandler
- database in always in other continent
- async await use while connecting to db


## file handling

- today, we commonly not handle file on our server
- we use 3rd party service or aws upload (both have same method)


## file upload

- we can use multer or express file upload package
- we use multer in this project


## middleware

- agr ja rhe ho to khen to mjhe bhi mil k jana (by sir Hitesh) 😁


## HTTP (hyper text transfer protocol)

some termnologies
- **URL**: Uniform resource locator
- **URI**: Uniform resource identifier
- **URN**: Uniform resource name

### header

- these are meta data (key value pair)

**Working**
- for caching, authentication, manage state

**Before 2012 we use X as a prefix on header - but now it is not compulsory**

- Request Header --> from client
- Response Header --> from server
- Respresentation Header --> encoding/compression
- Payload header --> data (payload is fancy name for data)

**types of data accept**

- json/application
- User Agent
- Authorization
- Content -- type
- Cookie
- Cache -- Control


**Cors headers**

- Access control allow origin
- Access control allow credentials
- Access control allow method


**Security**

- Cors origin embedder policy
- Cors origin opener policy
- Content security policy
- X- XSC- policy


### HTTP methods

- GET (most common - retrieve)
- HEAD (very less use - no boby message - header wapas ata hai)
- OPTIONS (what opr are available)
- TRACE (loopback test)
- DELETE (remove a resource)
- PUT (replace the resource)
- POST (intract with resource - add product/ user)
- PATCH (change a part of a resource)


### status code

see on internet

- 1xx (informational)
- 2xx (success)
- 3xx (redirection)
- 4xx (client error)
- 5xx (server error)


# Todo

in update avatar, make utility function that delete old avatar from cloudinary (pending)