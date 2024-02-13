const soap = require('soap');
const readline = require('readline');

const url = 'https://www.cbr.ru/DailyInfoWebServ/DailyInfo.asmx?WSDL';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function getAllValutes() {
    try {
        const client = await soap.createClientAsync(url);
        const result = await client.EnumValutesXMLAsync({ Seld: false });
        console.log(result);

        const valutes = result[0].EnumValutesXMLResult.ValuteData.ValuteCursOnDate;

        if (!valutes) {
            console.log("Не удалось получить данные о валютах.");
            return;
        }

        const valuteArray = Array.isArray(valutes) ? valutes.map(valute => {
            return {
                code: valute.Vcode,
                name: valute.Vname,
                value: parseFloat(valute.Vcurs)
            };
        }) : [];

        console.log(valuteArray);
    } catch (error) {
        console.log("Произошла ошибка при получении данных о валютах:", error.message);
    }
}


async function getValute(valuteCode, fromDate, toDate) {
    const client = await soap.createClientAsync(url);
    const result = await client.GetCursDynamicXMLAsync({
        FromDate: fromDate,
        ToDate: toDate,
        ValutaCode: valuteCode
    });
    const valuteDynamic = result[0].GetCursDynamicXMLResult.ValuteData.ValuteCursDynamic;

    const valuteDynamicArray = valuteDynamic.map(dynamic => {
        return {
            date: dynamic.CursDate,
            value: parseFloat(dynamic.Vcurs)
        };
    });

    console.log(valuteDynamicArray);
}

rl.question('Введите код валюты: ', async (valuteCode) => {
    rl.question('Введите начальную дату в формате YYYY-MM-DD: ', async (fromDate) => {
        rl.question('Введите конечную дату в формате YYYY-MM-DD: ', async (toDate) => {
            await getValute(valuteCode, fromDate, toDate);
            rl.close();
        });
    });
});

getAllValutes();
