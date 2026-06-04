var config = {
    map: {
        "*": {
            "mgz.owlcarousel": "Magezon_Core/js/owl.carousel.min",
            'jquery-ui-modules/widget': 'Magezon_Core/js/jquery/ui-modules/widget'
        }
    },
    shim: {
       "mgz.owlcarousel": {
            deps:['jquery']
        },
        "Magezon_Core/js/owl.carousel.min": {
            deps:['jquery']
        },
        'Magezon_Core/js/jquery-scrolltofixed-min': {
            deps: ['jquery']
        }
    }
};