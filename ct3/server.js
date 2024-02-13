const soap = require('soap');
const http = require('http');

const url = 'https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx?WSDL';

const server = http.createServer(function(request,response) {
    response.end("404: Not Found: " + request.url);
});

server.listen(8000);

async function handleGetValutes(args) {
    const client = await soap.createClientAsync(url);
    const result = await client.GetCursOnDateXMLAsync({ On_date: new Date() });

    const valutes = result[0].GetCursOnDateXMLResult.ValuteData.ValuteCursOnDate;

    const valuteArray = valutes.map(valute => {
        return {
            code: valute.Vcode,
            name: valute.Vname,
            value: parseFloat(valute.Vcurs)
        };
    });

    return { getValutesResult: { ValuteData: valuteArray } };
}

async function handleGetValute(args) {
    const client = await soap.createClientAsync(url);
    const result = await client.GetCursDynamicXMLAsync({
        FromDate: args.FromDate,
        ToDate: args.ToDate,
        ValutaCode: args.ValutaCode
    });

    const valuteDynamic = result[0].GetCursDynamicXMLResult.ValuteData.ValuteCursDynamic;

    const valuteDynamicArray = valuteDynamic.map(dynamic => {
        return {
            date: dynamic.CursDate,
            value: parseFloat(dynamic.Vcurs)
        };
    });

    return { getValuteResult: { ValuteData: valuteDynamicArray } };
}

soap.listen(server, '/soap', {
    getValutes: handleGetValutes,
    getValute: handleGetValute
}, url);