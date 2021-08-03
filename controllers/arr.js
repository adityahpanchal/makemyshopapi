let arr = [
    {
        tId: 't1',
        sId: 's1',
        id: '1',
        pId: 'p1'
    },
    {
        tId: 't1',
        sId: 's2',
        id: '2',
        pId: 'p2'
    },
    {
        tId: 't1',
        sId: 's1',
        id: '3',
        pId: 'p3'
    },
    {
        tId: 't2',
        sId: 's3',
        id: '4',
        pId: 'p4'
    },
    {
        tId: 't2',
        sId: 's2',
        id: '5',
        pId: 'p5'
    },
    {
        tId: 't8',
        sId: 's9',
        id: '6',
        pId: 'p11'
    }
]

let filtertId = arr.map(x => x.tId).filter((y, i, ar) => ar.indexOf(y) === i)
console.log(filtertId)

// let ad = filtertId.map(x => {
//     return arr.reduce((acc, curr) => {
//         return curr.tId === x ? [...acc, curr] : acc
//     }, [])
// })
// console.log(ad)

// let abc = filtertId.map(x => {
//     return arr.filter(y => {
//         return y.tId === x
//     }).map(z => {
//         return {
//             tId: x,
//             sId: z.sId
//         }
//     }).reduce((unique, item) => {
//         return unique.includes(item.sId) ? unique : [...unique, item]
//     }, [])
// }) 

// console.log(abc)