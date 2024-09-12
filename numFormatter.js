/**
 * 숫자 -> 한글 Formatter
 * @version 1.1
 * @author twlee
 * @param origin {String | Number} 입력 숫자
 * @param type {String} 포맷 타입
 * mix: 숫자-한글병기 (default)
 * korean: 금융권 한글 (소수점 무시)
 * @returns {String}
 */
const numFormatter = (origin, type) => {
    const koreanNum = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구']
    const digitSymbol = ['', '십', '백', '천']
    const scaleSymbol = ['', '만', '억', '조', '경', '해']

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
        const origin = (value) ? value : 0

        const divided = String(origin).split('.')
        const intPart = divided[0]
        const floatPart = divided[1]
        const pureNum = intPart.replace(/\D/g, '')
        const chain = {}
        let result

        const destruct = () => {
            result = pureNum.split('')
                .reverse()
                .map((n, index) => {
                    const tokenIndex = index % 4
                    const scaleIndex = Math.floor(index / 4)
                    return {
                        tokenIndex,
                        scaleIndex,
                        number: n,
                        korean: koreanNum[n]
                    }
                })
            return chain
        }

        chain.splitAndMixFormat = () => {
            const tmp = result.map((n) => {
                const symbol = n.scaleIndex !== 0 ? `${scaleSymbol[n.scaleIndex]} ` : ''
                return `${n.number}${n.tokenIndex === 0 ? symbol : ''}`
            })
            result = util.splitByDigits(4, tmp)
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

        chain.splitAndFormat = () => {
            result = util.splitByDigits(4, result)
                .reduce((acc, cur) => {
                    return acc.concat(cur.reduce((acc, cur) => {
                        if (parseInt(cur.number, 10) !== 0) {
                            acc.push(`${cur.korean}${digitSymbol[cur.tokenIndex]}${cur.tokenIndex === 0 ? `${scaleSymbol[cur.scaleIndex]} ` : ''}`)
                        } else if(cur.tokenIndex === 0 && cur.scaleIndex >= 1) {
                            acc.push(`${scaleSymbol[cur.scaleIndex]} `)
                        }
                        return acc
                    }, []))
                }, [])
                .reverse()
            return chain
        }

        chain.assemble = () => {
            result = result.join('').trim()

            if (parseInt(intPart, 10) < 0) {
                result = `-${result}`
            }
            if (floatPart) {
                if (type !== 'korean') {
                    result = `${result}.${floatPart}`
                } else {
                    const t = floatPart.split('').map(n => koreanNum[n]).join('')
                    result = `${result} 점 ${t}`
                }
            }

            return chain
        }

        chain.get = () => {
            return result ? result : 0
        }

        /**
         * 숫자-한글 병기 포맷
         * @returns {*}
         */
        this.numAndKorean = () => {
            return destruct()
                .splitAndMixFormat()
                .assemble()
                .get()
        }

        this.korean = () => {
            return destruct()
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

    // 금융권 한글
    if (type === 'korean') {
        return f.korean()
    }

    // default
    return f.numAndKorean()
}
