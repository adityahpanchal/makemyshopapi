require('dotenv').config()

const mongoose = require('mongoose')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')
// const multer = require('multer');
// const upload = multer();

//My routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')
const categoryRoutes = require('./routes/category')
const businessProfileRoutes = require('./routes/businessProfile')
const testRoutes = require('./routes/Test')
const imgRoutes = require('./routes/getImages')
const productRoutes = require('./routes/product')
const countRoute = require('./routes/count')
const wishlistRoute = require('./routes/wishlist')
const cartRoute = require('./routes/cart')
const hitRoutes = require('./routes/hit')
const ReviewRoutes = require('./routes/Review')
const orderRoutes = require('./routes/orders')
//DB Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('DB CONNECTED')
  })

//Middlewares
app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors())
// app.use(upload.array()); 

//My Routes
app.use('/api', authRoutes)
app.use('/api', userRoutes)
app.use('/api', categoryRoutes)
app.use('/api', businessProfileRoutes)
app.use('/api', testRoutes)
app.use('/api', imgRoutes)
app.use('/api', productRoutes)
app.use('/api', countRoute)
app.use('/api', wishlistRoute)
app.use('/api', cartRoute)
app.use('/api', hitRoutes)
app.use('/api', ReviewRoutes)
app.use('/api', orderRoutes)

//PORT
const port = process.env.PORT || 8000

//Starting a server
app.listen(port, () => {
  console.log(`app is running at ${port}`)
})
