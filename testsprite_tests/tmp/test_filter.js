const fs = require('fs');
// Let's mock window.allVehicles and see what applyFilters does
let allVehicles = [
    { id: 1, name: "Car 1", category: "Coupe", brand_id: 881 },
    { id: 2, name: "Car 2", category: "Sedan", brand_id: 882 }
];

let currentVehicles = [];

function testFilters(category, brand) {
    currentVehicles = allVehicles.filter(v => {
        return (category === '' || v.category === category) &&
               (brand === '' || v.brand_id == brand);
    });
    console.log(`category: '${category}', brand: '${brand}' -> found ${currentVehicles.length}`);
}

testFilters('', '');
testFilters('Coupe', '');
testFilters('', '881');
testFilters('Coupe', '881');
testFilters('Sedan', '881');
