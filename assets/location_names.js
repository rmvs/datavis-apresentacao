var locs = {
    'Afghanistan' : ['Afghanstan']
    ,'Angola' : ['off Angola']
    ,'Australia' : ['Qld. Australia', 'Queensland  Australia', 'Tasmania', 'off Australia']
    ,'Argentina' : ['Aregntina']
    ,'Azores' : ['Azores (Portugal)']
    ,'Bangladesh' : ['Baangladesh']
    ,'Bahamas' : ['Great Inagua']
    ,'Bermuda' : ['off Bermuda']
    ,'Bolivia' : ['Boliva', 'BO']
    ,'Bosnia Herzegovina' : ['Bosnia-Herzegovina']
    ,'Bulgaria' : ['Bugaria', 'Bulgeria']
    ,'Canada' : ['British Columbia', 'British Columbia Canada', 'Canada2','Saskatchewan', 'Yukon Territory']
    ,'Cameroon' : ['Cameroons', 'French Cameroons']
    ,'Cape Verde' : ['Cape Verde Islands']
    ,'Chile' : ['Chili']
    ,'Comoros' : ['Comoro Islands', 'Comoros Islands']
    ,'Djibouti' : ['Djbouti', 'Republiof Djibouti']
    ,'Dominican Republic' : ['Domincan Republic', 'Dominica']
    ,'Democratic Republic of Congo' : ['Belgian Congo', 'Belgian Congo (Zaire)', 'Belgium Congo','DR Congo', 'DemocratiRepubliCogo', 'DemocratiRepubliCongo','DemocratiRepubliof Congo', 'DemoctratiRepubliCongo', 'Zaire',    'Zaïre']
    ,'French Equatorial Africa' : ['French Equitorial Africa']
    ,'Germany' : ['East Germany', 'West Germany']
    ,'Greece' : ['Crete']
    ,'Haiti' : ['Hati']
    ,'Hungary' : ['Hunary']
    ,'India' : ['Indian']
    ,'Indonesia' : ['Inodnesia', 'Netherlands Indies']
    ,'Jamaica' : ['Jamacia']
    ,'Malasya' : ['Malaya']
    ,'Myanmar' : ['Manmar']
    ,'Mauritania' : ['Mauretania']
    ,'Morocco' : ['Morrocco', 'Morroco']
    ,'Netherlands' : ['Amsterdam', 'The Netherlands']
    ,'Nigeria' : ['Niger']
    ,'Philipines' : ['Philipines', 'Philippine Sea', 'Phillipines','off the Philippine island of Elalat']
    ,'Romania' : ['Romainia']
    ,'Russia' : ['Russian', 'Soviet Union', 'USSR']
    ,'Saint Lucia' : ['Saint Lucia Island']
    ,'Samoa' : ['Western Samoa']
    ,'Sierre Leone' : ['Sierre Leone']
    ,'South Africa' : ['South Africa (Namibia)']
    ,'Surinam' : ['Suriname']
    ,'UAE' : ['United Arab Emirates']
    ,'United Kingdom' : ['England', 'UK', 'Wales', '110 miles West of Ireland']
    ,'U.S. Virgin Islands' : ['US Virgin Islands', 'Virgin Islands']
    ,'Wake Island' : ['325 miles east of Wake Island']
    ,'Sweden' : ['Swden']
    ,'Yugoslavia' : ['Yugosalvia']
    , 'Zimbabwe' : ['Rhodesia', 'Rhodesia (Zimbabwe)']
    }  

usNames = ['Virginia','New Jersey','Ohio','Pennsylvania', 'Maryland', 'Indiana', 'Iowa',
    'Illinois','Wyoming', 'Minnisota', 'Wisconsin', 'Nevada', 'NY','California',
    'WY','New York','Oregon', 'Idaho', 'Connecticut','Nebraska', 'Minnesota', 'Kansas',
    'Texas', 'Tennessee', 'West Virginia', 'New Mexico', 'Washington', 'Massachusetts',
    'Utah', 'Ilinois','Florida', 'Michigan', 'Arkansas','Colorado', 'Georgia','Missouri',
    'Montana', 'Mississippi','Alaska','Jersey', 'Cailifornia', 'Oklahoma','North Carolina',
    'Kentucky','Delaware','D.C.','Arazona','Arizona','South Dekota','New Hampshire','Hawaii',
    'Washingon','Massachusett','Washington DC','Tennesee','Deleware','Louisiana',
    'Massachutes', 'Louisana', 'New York (Idlewild)','Oklohoma','North Dakota','Rhode Island',
    'Maine','Alakska','Wisconson','Calilfornia','Virginia','Virginia.','CA','Vermont',
    'HI','AK','IN','GA','Coloado','Airzona','Alabama','Alaksa' 
    ]

function getCountry(q) {
    var loc = q.Location.split(',').map(s => s.replace('Near','').trim());
    var keys = Object.keys(locs);
    var values = Object.values(locs);
    var idx = -1;
    if(usNames.indexOf(loc[1]) > -1){
        return 'United States of America'
    }

    
    for(var k = 0;k < loc.length;k++){
        if(idx > -1) break;
        for(var v = 0;v < values.length;v++){
            if(values[v].indexOf(loc[k]) > -1){
                //idx = k;
                idx = v;
                break;
            }
        }
    }
    return idx == -1 ? (loc.length > 1 ? loc[1] : loc[0]) : keys[idx];
}



