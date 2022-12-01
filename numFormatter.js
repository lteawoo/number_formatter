/**
 * 숫자 -> 한글 Formatter
 * @author twlee
 * @param origin {String | Number} 입력 숫자
 * @param type {String} 포맷 타입
 * mix: 숫자-한글병기 (default)
 * @returns {String}
 */
const numFormatter = (origin, type) => {
    const util = {
        splitByDigits: (digits, arr) => {
            const result = []

            for (let index = 0; index < arr.length; index += digits) {
                result.push(arr.slice(index, index + digits))
            }

            return result
        },

        trimZero: (arr) => {
            let index = arr.length - 1

            while (index >= 0 && parseInt(arr[index], 10) === 0) {
                index -= 1
            }

            return arr.slice(0, index + 1)
        }
    }

    const formatter = function (value) {
        const origin = (value && value.length > 0) ? value : 0

        const scaleSymbol = ['', '만 ', '억 ', '조 ', '경 ', '해 ']
        const divided = String(origin).split('.')
        const intPart = divided[0]
        const floatPart = divided[1]
        const pureNum = intPart.replace(/\D/g, '')
        const chain = {}
        let result

        chain.toToken = () => {
            result = pureNum.split('')
                .reverse()
                .map((n, index) => {
                    const unitIndex = index % 4
                    const dotIndex = Math.ceil(index / 4)
                    const scale = unitIndex === 0 ? scaleSymbol[dotIndex] : ''
                    return `${n}${scale}`
                })
            return chain
        }

        chain.splitAndFormat = () => {
            result = util.splitByDigits(4, result)
                .map((n) => {
                    const r = util.trimZero(n)

                    if (r.length === 4) {
                        r.splice(3, 0, ',')
                    }

                    return r
                })
                .reduce((acc, cur) => acc.concat(cur), [])
                .reverse()
            return chain
        }

        chain.assemble = () => {
            result = result.join('').trim()

            if (parseInt(intPart, 10) < 0) {
                result = `-${result}`
            }
            if (floatPart) {
                result = `${result}.${floatPart}`
            }

            return chain
        }

        chain.get = () => {
            return result
        }

        /**
         * 숫자-한글 병기 포맷
         * @returns {*}
         */
        this.numAndKorean = () => {
            return chain.toToken()
                .splitAndFormat()
                .assemble()
                .get()
        }
    }

    const f = new formatter(origin)

    // 숫자, 한글 병기 (ex: 네이버 금리계산기 등)
    if (type === 'mix') {
        return f.numAndKorean()
    }

    // 순수 한글 (일억 삼천만 등 구현 필요시 구현 후 분기)
    if (type === 'korean') { }

    // default
    return f.numAndKorean()
}