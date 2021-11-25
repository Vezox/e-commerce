// convertPrice
function convertPrice(cls, atr) {
    const prices = document.querySelectorAll(cls)
    prices.forEach(e => {
        e.innerText = (e.getAttribute(atr) - 0).toLocaleString() + ' đ'
    })
}
convertPrice('.product-price', 'data-price')


// header
const header = document.querySelector('header')
window.addEventListener('scroll', e => {
    if (window.scrollY < 300) {
        header.classList.add('scroll')
    } else {
        header.classList.remove('scroll')
    }
})


// search
const input = document.querySelector('#search-input')
const searchValue = document.querySelector('#search-value')
window.onclick = (e) => {
    if (e.target.classList.contains('search-input') || e.target.classList.contains('search-link')) {
        searchValue.classList.add('active')
    } else {
        searchValue.classList.remove('active')
    }
}

input.onkeyup = () => {
    let text = input.value
    if (text != '') {
        $.ajax({
            url: '/search-products/?search=' + text,
            type: 'GET',
            success: (data) => {
                let products = data.products
                if (products.length > 0) {
                    const html = products.reduce((acc, product) => {
                        acc.push(`
                            <div class="search-item">
                                <a href="/product/details/${product.slug}.${product._id}">
                                    <div class="search-img">
                                        <img src="${product.coverImg}" alt="" class="search-link">
                                    </div>
                                    <div class="search-content">
                                        <p class="search-name search-link">
                                            ${product.productName}
                                        </p>
                                        <p class="search-price search-link">
                                            ${(product.price * (100 - product.discount) / 100).toLocaleString()} đ
                                        </p>
                                    </div>
                                </a>
                            </div>
                        `)
                        return acc
                    }, []).join('')

                    searchValue.innerHTML = html
                } else {
                    searchValue.innerHTML = '<div style="color: #000000; margin: auto; font-size: 20px">Không Tìm Thấy Sản Phẩm</div>'
                }
            },
            error: (err) => {
                console.log(err.message);
            }
        })
    }
}

//filter products
let pageIndex = 1
let pageTotal = 2
const options = document.querySelector('#select-options')
const sort = document.querySelector('#sort-products')
const selects = document.querySelectorAll('.form-select')
const listProduct = document.getElementById('content-list-product')
selects.forEach(select => {
    select.onchange = async (e) => {
        let products = null
        await $.ajax({
            url: '/filter-products/?options=' + options.value + '&sort=' + sort.value + '&pageIndex=0',
            type: 'GET',
            success: (data) => {
                products = data.products
                pageTotal = data.pageTotal
                pageIndex = 1
            },
            error: (err) => {
                console.log(err.message);
            }
        })

        const html = products.reduce((acc, product) => {
            acc.push(`
                <div class="product-item">
                    <a href="/product/details/${product.slug}.${product._id}">
                        <div class="product-img">
                            <img src="${product.coverImg}" alt="">
                        </div>
                        <div class="product-content">
                            <div class="product-name">
                                ${product.productName}
                            </div>
                            <div class="product-price">
                                ${(product.price * (100 - product.discount) / 100).toLocaleString()} đ
                            </div>
                        </div>
                    </a>
                </div>
            `)
            return acc
        }, []).join('')

        listProduct.innerHTML = html
        if (pageTotal == pageIndex) {
            document.getElementById('load-page').style.display = 'none'
        } else {
            document.getElementById('load-page').style.display = 'inline-block'
        }
    }
})

// load products
const btnLoadPage = document.querySelector('#load-page')
btnLoadPage.onclick = async () => {
    if (pageTotal > pageIndex) {
        let loadProducts = null
        await $.ajax({
            url: '/filter-products/?options=' + options.value + '&sort=' + sort.value + '&pageIndex=' + pageIndex,
            type: 'GET',
            success: (data) => {
                loadProducts = data.products
                pageTotal = data.pageTotal
                pageIndex++
            },
            error: (err) => {
                console.log(err.message);
            }
        })

        loadProducts.forEach(product => {
            const html = `
                <a href="/product/details/${product.slug}.${product._id}">
                    <div class="product-img">
                        <img src="${product.coverImg}" alt="">
                    </div>
                    <div class="product-content">
                        <div class="product-name">
                            ${product.productName}
                        </div>
                        <div class="product-price">
                            ${(product.price * (100 - product.discount) / 100).toLocaleString()} đ
                        </div>
                    </div>
                </a>
            `
            let div = document.createElement('div')
            div.innerHTML = html
            div.classList.add('product-item')
            listProduct.appendChild(div)
        })
    }
    if (pageTotal == pageIndex) {
        document.getElementById('load-page').style.display = 'none'
    }
}