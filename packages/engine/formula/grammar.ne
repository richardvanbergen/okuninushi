@{%
import lexer from "./lexer"

function arithmeticPost(data: any) {
    return {
        ...data[0],
        type: 'arithmetic',
        value: {
            left: data[0],
            operator: data[2],
            right: data[4],
        }
    }
}

function comparisonPost(data: any) {
    return {
        ...data[0],
        type: 'comparison',
        value: {
            a: data[0],
            operator: data[2],
            b: data[4],
        }
    }
}

function numberPost(data: any) {
    const parsed = data[0]
    if (parsed) {
        parsed.value = Number(parsed.text)
        return parsed
    }
}

function functionPost(data: any) {
    data[0].type = "function"
    const params = data[4]?.[0] ?? []
    data[0].value = {
        name: data[0].text,
        params
    }

    return data[0]
}

function booleanPost(data: any) {
    const parsed = data[0]
    if (parsed) {
        parsed.value = parsed.text === "true"
        return parsed
    }
}

function eachPost(data: any) {
    const parsed = {...data[0]}
    parsed.type = 'each'
    parsed.text = 'each'
    parsed.value = {
        context: data[0],
        body: data[4]
    }
    return parsed
}

function functionParamPost(data: any) {
    const funcParam = Array.isArray(data[4]) ? data[4] : [data[4]]
    return [data[0], ...funcParam]
}

function scopedReferencePost(data: any) {
    const parts = data[0].value.split('.').reduce((acc: string[], cur: string) => {
        const startBracketIndex = cur.indexOf('[')
        const endBracketIndex = cur.indexOf(']')

        if (startBracketIndex !== -1 && endBracketIndex !== -1) {
            const id = cur.slice(0, startBracketIndex)
            const arrIndex = cur.slice(startBracketIndex + 1, endBracketIndex)
            return [...acc, id, arrIndex]
        }

        return [...acc, cur]
    },[])

    const [ identifier, ...subpath ] = parts

    data[0].value = { subpath }
    return data[0]
}

function referencePost(data: any) {
    const [_, value] = data[0].value.split("$")

    const parts = value.split('.').reduce((acc: string[], cur: string) => {
        const startBracketIndex = cur.indexOf('[')
        const endBracketIndex = cur.indexOf(']')

        if (startBracketIndex !== -1 && endBracketIndex !== -1) {
            const id = cur.slice(0, startBracketIndex)
            const arrIndex = cur.slice(startBracketIndex + 1, endBracketIndex)
            return [...acc, id, arrIndex]
        }

        return [...acc, cur]
    },[])

    const [ identifier, ...subpath ] = parts

    data[0].value = { identifier, subpath }
    return data[0]
}
%}

@lexer lexer
@preprocessor typescript

main -> %ws:* value %ws:* {% data => data[1] %}
value -> formula

formula -> formula_identifier each {% data => ({ ...data[0], value: data[1] }) %}
         | formula_identifier operation {% data => ({ ...data[0], value: data[1] }) %}

formula_identifier -> %formula {% id %}

operation -> arithmetic {% id %} | comparison {% id %} | boolean {% id %} | string {% id %}

arithmetic -> addition_subtraction {% data => { return data[0] } %}

addition_subtraction -> addition_subtraction %ws:* plus %ws:* multiplication_division {% arithmeticPost %}
                      | addition_subtraction %ws:* minus %ws:* multiplication_division {% arithmeticPost %}
                      | multiplication_division {% id %}

multiplication_division -> multiplication_division %ws:* times %ws:* exponent {% arithmeticPost %}
                         | multiplication_division %ws:* divide %ws:* exponent {% arithmeticPost %}
                         | exponent {% id %}

exponent -> parens %ws:* exponent %ws:* exponent {% arithmeticPost %}
          | parens {% id %}

parens -> "(" %ws:* arithmetic %ws:* ")" {% data => data[2] %}
        | number {% id %}

plus -> %plus {% id %}
minus -> %minus {% id %}
times -> %times {% id %}
divide -> %divide {% id %}
exponent -> %exponent {% id %}

number -> %number {% numberPost %}
        | function {% id %}
        | reference {% id %}
        | scoped_reference {% id %}

each -> reference %ws:+ %each %ws:+ operation {% eachPost %}
      | function %ws:+ %each %ws:+ operation {% eachPost %}

function -> identifier %ws:* "(" %ws:* parameter_list:* %ws:* ")" {% functionPost %}

parameter_list
    -> function_param %ws:* "," %ws:* parameter_list {% functionParamPost %}
     | function_param

function_param -> arithmetic {% id %}
                | boolean {% id %}
                | comparison {% id %}
                | string {% id %}

comparison -> comparable %ws:* comparison_operator %ws:* comparable {% comparisonPost %}
comparable -> number {% id %} | boolean {% id %} | string {% id %}
comparison_operator -> %equals {% id %} | %not_equals {% id %} | %lt {% id %} | %lte {% id %} | %gt {% id %} | %gte {% id %}

reference -> %reference {% referencePost %}
scoped_reference -> %scoped_reference {% scopedReferencePost %}
identifier -> %identifier {% id %}
string -> %string {% id %}
boolean -> %boolean {% booleanPost %}
