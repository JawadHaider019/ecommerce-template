import axios from 'axios';

const testApi = async () => {
    try {
        const response = await axios.get('http://localhost:4000/api/product/list');
        const products = response.data.products;
        console.log(`Total products: ${products.length}`);

        if (products && products.length > 0) {
            const sample = products.slice(0, 5);
            sample.forEach(p => {
                console.log(`- ${p.name}: slug=${p.slug}, _id=${p._id}`);
            });

            const productsMissingSlugs = products.filter(p => !p.slug);
            console.log(`Products missing slugs: ${productsMissingSlugs.length}`);
            if (productsMissingSlugs.length > 0) {
                productsMissingSlugs.slice(0, 5).forEach(p => console.log(`  * ${p.name}`));
            }
        } else {
            console.log('No products returned');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testApi();
