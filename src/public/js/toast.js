function toast({ title = '', message = '', type = '', duration = 3000 }) {
    const main = document.querySelector('#toast')
    if (main) {
        const icons = {
            success: 'bx bxs-check-circle',
            warning: 'bx bxs-error-circle',
            error: 'bx bxs-info-circle',
        }
        const toast = document.createElement('div')
        toast.style.animation = `slideOut ease .4s, slideIn ease 1s ${duration / 1000}s forwards`
        toast.classList.add('toast', `toast--${type}`)
        toast.innerHTML = `
                        <i class='toast_icon ${icons[type]}'></i>
                        <div class="toast_body">
                        <p class="toast_title">${title}</p>
                        <p class="toast_message">${message}</p>
                        </div>
                        <i class="toast_close fa-solid fa-xmark"></i>`
        main.appendChild(toast)

        let removeId = setTimeout(() => {
            main.removeChild(toast)
        }, duration + 900);

        toast.onclick = (e) => {
            if (e.target.closest('.toast_close')) {
                main.removeChild(toast)
                clearTimeout(removeId)
            }
        }
    }
}

function showSuccess() {
    toast({
        title: 'Thành công',
        message: 'Đã thêm vào giỏ hàng',
        type: 'success',
        duration: 1500
    })
}

function showWarning() {
    toast({
        title: 'Thất bại',
        message: 'Thêm vào giỏ hàng thất bại',
        type: 'warning',
        duration: 3000
    })
}