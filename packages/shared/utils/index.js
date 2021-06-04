import moment from "moment";


export function getCustomizedDateString(date, bUpperCase=true) {

    var formattedDateString = "";
    
    if(typeof date.setMonth === 'function')
    {
        var newDate = new Date(date.getTime());

        newDate = newDate.setMonth(newDate.getMonth() - 1)
        
        formattedDateString = moment(newDate).format('MMM Do, YYYY')
    }else
    {
        var newDate = date.year + "-" + (date.month < 10 ? "0" + date.month : date.month) + "-" + (date.day < 10 ? "0" + date.day : date.day)
        
        formattedDateString = moment(newDate).format('MMM Do, YYYY')
    }

    if(bUpperCase) {
        formattedDateString = formattedDateString.toUpperCase()
    }
    return formattedDateString
}

export function getCustomizedDateDefaultString(date, bUpperCase=true) {

    var formattedDateString = "";
    
    if(typeof date.setMonth === 'function')
    {
        var newDate = new Date(date.getTime());

        newDate = newDate.setMonth(newDate.getMonth())
        
        formattedDateString = moment(newDate).format('MMM DD, YYYY')
    }else
    {
        var newDate = date.year + "-" + (date.month < 10 ? "0" + date.month : date.month) + "-" + (date.day < 10 ? "0" + date.day : date.day)
        
        formattedDateString = moment(newDate).format('MMM DD, YYYY')
    }

    if(bUpperCase) {
        formattedDateString = formattedDateString.toUpperCase()
    }
    return formattedDateString
}

export function getCustomizedTimeString(date, bUpperCase=true) {
    
    var formattedTimeString = moment(date).format('h:mm a')
    if(bUpperCase) {
        formattedTimeString = formattedTimeString.toUpperCase()
    }

    return formattedTimeString
}