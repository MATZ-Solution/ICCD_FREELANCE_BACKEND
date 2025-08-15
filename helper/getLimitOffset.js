const limitOffset = (page, limit = 10 )=> {
    let offset = (page - 1) * limit
    return { offset, limit }
}

export default limitOffset;