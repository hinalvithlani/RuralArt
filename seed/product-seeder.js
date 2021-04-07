var Product=require('../models/product');
var mongoose=require('mongoose');
const { exists } = require('../models/product');
mongoose.connect('mongodb://localhost:27017/shopping',{ useNewUrlParser: true, useUnifiedTopology: true });
var products=[
new Product({
    imagePath:'https://www.namasteindiatrip.com/wp-content/uploads/2020/02/Gujarati-Dress-for-Male.jpg',
    title:'Multi-Color',
    category:'Mens',
    Price:'1000'
}),
new Product({
    imagePath:'https://i.pinimg.com/564x/67/c9/75/67c975f019fb54f18e85373ebc319b45.jpg',
    title:'Orange',
    category:'Women',
    Price:'990'
}),
new Product({
    imagePath:'https://5.imimg.com/data5/XR/EH/OF/IOS-15137084/product-jpeg-500x500.png',
    title:'Yellow',
    category:'Kids',
    Price:'800'
}),
new Product({
    imagePath:'https://i.pinimg.com/564x/89/50/b6/8950b632a0d5bc00a00240380d249068.jpg',
    title:'Red',
    category:'Mens',
    Price:'1390'
}),
new Product({
    imagePath:'https://i.pinimg.com/564x/1e/03/e8/1e03e80904b8325c74d0a1525c18036e.jpg',
    title:'Green',
    category:'Women',
    Price:'850'
}),
new Product({
    imagePath:'https://i.pinimg.com/564x/87/c2/1c/87c21c58d74be08eda9bbdd6a5ed86a5.jpg',
    title:'Blue',
    category:'Kids',
    Price:'1250'
}),
new Product({
    imagePath:'https://i.pinimg.com/564x/d0/2c/98/d02c98c0db5837c050bfa35079b97311.jpg',
    title:'Orange',
    category:'Mens',
    Price:'1580'
}),
new Product({
    imagePath:'https://sc01.alicdn.com/kf/U3dfe456ac6e7403faf92bce68fa43addc.jpg_350x350.jpg',
    title:'Pink',
    category:'Women',
    Price:'1890'
}),
new Product({
    imagePath:'https://4.imimg.com/data4/BI/UI/MY-14187327/boys-garba-dress-500x500.jpg',
    title:'Orange',
    category:'Kids',
    Price:'350'
})
];
var done=0;
for(var i=0;i<products.length;i++)
{
    products[i].save(function(err,result){
        done++;
        if(done===products.length){
            exit();
        }
    });
}
function exit(){
    mongoose.disconnect();
}