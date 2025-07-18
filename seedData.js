const categoriesData = [
    {
      id: 1,
      name: "Home",
      image_uri:
        "https://rukminim2.flixcart.com/fk-p-flap/121/121/image/18a00dd8cb47884d.jpg?q=60",
    },
    {
      id: 2,
      name: "Gadgets",
      image_uri:
        "https://rukminim2.flixcart.com/fk-p-flap/121/121/image/0492397449e17ed3.jpg?q=60",
    },
    {
      id: 3,
      name: "Beauty",
      image_uri:
        "https://rukminim2.flixcart.com/fk-p-flap/121/121/image/83ba03d54d13c193.jpg?q=60",
    },
    {
      id: 4,
      name: "Fashion",
      image_uri:
        "https://rukminim2.flixcart.com/fk-p-flap/121/121/image/ef81f0d558e28785.jpg?q=60",
    },
    {
      id: 5,
      name: "Mobiles",
      image_uri:
        "https://rukminim2.flixcart.com/fk-p-flap/121/121/image/e70a833bef33e023.jpg?q=60",
    },
    {
      id: 6,
      name: "Vehicles",
      image_uri:
        "https://rukminim2.flixcart.com/fk-p-flap/121/121/image/f16650118eeb2d0c.jpg?q=60",
    },
    {
      id: 7,
      name: "Appliances",
      image_uri:
        "https://rukminim2.flixcart.com/fk-p-flap/121/121/image/0d06f7f57666ea02.jpg?q=60",
    },
    {
      id: 8,
      name: "Electronics",
      image_uri:
        "https://rukminim2.flixcart.com/fk-p-flap/121/121/image/4a9b5861e488272c.jpg?q=60",
    },
    {
      id: 9,
      name: "Sports",
      image_uri:
        "https://rukminim2.flixcart.com/fk-p-flap/121/121/image/d1093d404ba12ebb.jpg?q=60",
    },
    {
      id: 10,
      name: "Food",
      image_uri:
        "https://rukminim2.flixcart.com/fk-p-flap/121/121/image/916c69ce7fae622b.jpg?q=60",
    },{
      id: 11,
      name: "Books",
      image_uri:
        "https://static.vecteezy.com/system/resources/previews/021/644/208/large_2x/books-stacked-on-top-of-each-other-created-with-generative-ai-photo.jpg",
    },{
      id: 12,
      name: "Kids Toys",
      image_uri:
        "https://img.freepik.com/premium-photo/toys-collection-isolated-background_488220-2432.jpg?semt=ais_hybrid&w=740",
    },
  ];
  
  const productData = [
    {
      name: "Slim Fit Jeans",
      price: 40,
      description:
        "Stylish slim fit jeans with a comfortable stretch for everyday wear.",
      image_uri:
        "https://rukminim2.flixcart.com/image/536/644/xif0q/jean/j/g/x/32-kjo-90725-slm-slmft-bk-killer-original-imah8766zycrw3xh.jpeg?q=60&crop=false",
      ar_uri: null,
      category: "Fashion",
    },
    {
      name: "Men's Casual Shirt",
      price: 30,
      description:
        "A lightweight casual shirt for men, perfect for both work and play.",
      image_uri:
        "https://rukminim2.flixcart.com/image/536/644/xif0q/shirt/o/g/i/xxl-deu017-deneeja-original-imah7v6ea6rfffxx.jpeg?q=60&crop=false",
      ar_uri: null,
      category: "Fashion",
    },
    {
      name: "Women's High Heel Shoes",
      price: 70,
      description:
        "Elegant high heel shoes for women, ideal for evening events and parties.",
      image_uri:
        "https://rukminim2.flixcart.com/image/430/516/xif0q/shoe/z/i/q/4-lbw-18-black-37-gardin-black-original-imagu2parz6j3yzh.jpeg?q=60&crop=false",
      ar_uri: null,
      category: "Fashion",
    },
    {
      name: "Men's Winter Coat",
      price: 150,
      description:
        "A warm and stylish winter coat designed to keep you comfortable and fashionable.",
      image_uri:
        "https://rukminim2.flixcart.com/image/536/644/xif0q/coat/a/i/o/xl-dlnxmcoat26black-chkokko-original-imah5f88ztuw4g9h.jpeg?q=60&crop=false",
      ar_uri: null,
      category: "Fashion",
    },
    {
      name: "Women's Leather Handbag",
      price: 100,
      description: "A sleek leather handbag for women, perfect for any occasion.",
      image_uri:
        "https://classyleatherbags.com/cdn/shop/collections/womens_leather_crossbody_bags_a113902c-6ed2-480e-8e9f-d24c09b5e4c7_1350x1350.jpg?v=1683775859",
      ar_uri: null,
      category: "Fashion",
    },
    {
      name: "Men's Jogger Pants",
      price: 40,
      description:
        "Comfortable and sporty jogger pants, perfect for workouts or casual outings.",
      image_uri:
        "https://assets.myntassets.com/w_412,q_60,dpr_2,fl_progressive/assets/images/27414062/2025/4/17/74c86cc5-83e8-4d2a-955e-29095345eab21744910076796-NOBERO-Men-Regular-Pure-Cotton-Joggers-8691744910076255-1.jpg",
      ar_uri: null,
      category: "Fashion",
    },
    {
      name: "Women's Wool Scarf",
      price: 25,
      description:
        "A soft wool scarf that adds warmth and style to any winter outfit.",
      image_uri:
        "https://rukminim2.flixcart.com/image/536/644/xif0q/scarf/2/a/e/free-size-wool-women-s-cold-weather-scarves-wraps-pack-of-1-blue-original-imagt3zfukagxh4g.jpeg?q=60&crop=false",
      ar_uri: null,
      category: "Fashion",
    },
    {
      name: "Men's Sporty Sneakers",
      price: 80,
      description:
        "Durable and lightweight sneakers designed for sports and active wear.",
      image_uri:
        "https://rukminim2.flixcart.com/image/430/516/kr6oeq80/shoe/t/n/o/10-kc043-blu-k-footlance-blue-original-imag5ffhftjgga9s.jpeg?q=60&crop=false",
      ar_uri: null,
      category: "Fashion",
    },
    {
      name: "Men's Denim Jacket",
      price: 70,
      description:
        "A classic denim jacket that pairs well with almost any outfit.",
      image_uri:
        "https://rukminim2.flixcart.com/image/536/644/xif0q/jacket/c/y/6/l-no-kttmensdenimjacket165-kotty-original-imagx8t9vex57f3u.jpeg?q=60&crop=false",
      ar_uri: null,
      category: "Fashion",
    },
    {
      name: "Women's Floral Dress",
      price: 55,
      description:
        "A beautiful floral dress ideal for spring and summer, featuring a flattering fit.",
      image_uri:
        "https://rukminim2.flixcart.com/image/536/644/xif0q/dress/q/7/4/xxl-dd-076-bottle-green-drape-and-dazzle-original-imagt4szwnaxhf7s.jpeg?q=60&crop=false",
      ar_uri: null,
      category: "Fashion",
    },
    {
      name: "Men's Sneakers",
      price: 75,
      description:
        "Comfortable and trendy sneakers, suitable for daily wear and sports.",
      image_uri:
        "https://rukminim2.flixcart.com/image/430/516/xif0q/shoe/r/q/b/9-100-corsac-black-original-imagzx8vhacynhcy.jpeg?q=60&crop=false",
      ar_uri: null,
      category: "Fashion",
    },    {
      name: "Books on JavaScript",
      price: 900,
      description:
        "An in-depth guide to JavaScript programming, covering advanced topics and best practices.",
      image_uri:
        "https://rukminim2.flixcart.com/image/430/516/xif0q/shoe/r/q/b/9-100-corsac-black-original-imagzx8vhacynhcy.jpeg?q=60&crop=false",
      ar_uri: null,
      category: "Books",
    },    {
      name: "Toys for Kids",
      price: 30,
      description:
        "A set of educational toys designed to enhance learning and creativity in children.",
      image_uri:
        "https://th.bing.com/th/id/OIP.1pq_RQS0bPxB_YM6IWD5DwHaHa?rs=1&pid=ImgDetMain",
      ar_uri: null,
      category: "Toys",
    },
  ];
  
  module.exports = { categoriesData, productData };
