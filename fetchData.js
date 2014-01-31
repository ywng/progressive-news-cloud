/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 * http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
 /**
 * Author: NG, Yik-wai Jason
 * Contact & Support: ywng@ust.hk
 * The Hong Kong University of Science and Technology
 * Data Visualization, CSE, HKUST
 */
 
//The main data source of the word cloud
//format:
//news array
//   news object
//      title
//      date
//      category
//      content

var newsArray;
var wordFreqArray;
var freqMap;
var stopWords;
var numWordsDisplay=110;

function _init(){
	// fetch data from server
	//should have some sort of API for getting the data
	$.ajax({
		url: "http://mktinsight.ywng.cloudbees.net/FetchNews?category=finance",
		context: document.body,
		dataType: "json", 
		headers : {Accept : "application/json"},
		type: 'GET', 
		async: false,
		success: function(data, textStatus, jqXHR){
			//fetch succeeded
			newsArray=new Array();
			for(var i=0; i < data.length; i++) {
				var article=new Object();
				article.title=data[i].title;
				article.date=data[i].date;
				article.category=data[i].category;
				article.content=data[i].content;
				article.link=data[i].link;

				newsArray[i]=article;

			}

			freqCounting();
		},
		error: function(jqHXR, textStatus, errorThrown) {
			console.log('ajax error in get survey ID call:' +textStatus + ' ' + errorThrown);
		}

	 }); // end of the ajax call

}

function removeMeaningLessWords(word){
	if(word.indexOf('@') > -1)
		return null;

	if(isNumber(word)){
		return null;
	}

    if(stopWords.containsKey(word.toLowerCase())){
    	return null;
    }

    return word;
}

function freqCounting(){
 	wordFreqArray=new Array();

 	freqMap=new HashMap();
 	//freqMap.put("aaa", 3);
 	//console.log(freqMap.get("aaa"));

 	for(var i=0; i < newsArray.length; i++) {
 		var words=newsArray[i].content.split(" ");

 		for(var j=0; j < words.length; j++) {
 			//console.log("Before:",words[j]);
			words[j]=words[j].replace(/[,"';:{}‘’!.<>?“”$#%&*()@，-]*/g,"");
			//console.log("After:", words[j]);
 		
 			if(removeMeaningLessWords(words[j])){
		 		if(freqMap.containsKey(words[j])){
		 			var freqObj=freqMap.get(words[j]);
		 			freqObj.freq=freqObj.freq+parseInt('1');
		 			//console.log(freqObj.freq);
		 			freqObj.articleContain.put(i,"YES");
		 			freqMap.put(words[j],freqObj);

		 		}else{
		 			var freqObj=new Object();
		 			freqObj.freq=parseInt('1');
		 			freqObj.articleContain=new HashMap();
		 			freqObj.articleContain.put(i,"YES");
		 			//console.log(freqObj.freq);
		 			freqMap.put(words[j],freqObj);
		 		}
		 	}
		}

 	}

 	var freqMapKeySet=freqMap.keys();
 	var j=0;
 	for(var i=0;i<freqMapKeySet.length;i++){
 		
 		var freqCount=freqMap.get(freqMapKeySet[i]).freq;
 		if(freqCount>1){
 			//we need 60 most frequent words
 			//find the insertion pos
 			var arrayObj=new Object();
	 		arrayObj.text=freqMapKeySet[i];
	 		arrayObj.size=freqCount;
	 		arrayObj.articleContain=freqMap.get(freqMapKeySet[i]).articleContain;

 			if(j>0){
 				var finalIndex;
 				if(j>numWordsDisplay)
 					finalIndex=numWordsDisplay;
 				else
 					finalIndex=j;
 				for(var k=finalIndex-1;k>=0;k--){
 					//console.log(k);
 					if(freqCount>wordFreqArray[k].size){
 						if(k<numWordsDisplay-1){
 							wordFreqArray[k+1]=wordFreqArray[k];
 							if(k==0){
 								wordFreqArray[k]=arrayObj;
 							}
 						}
 					}else{
 						wordFreqArray[k+1]=arrayObj;
 						break;
 					}
 				}

 			}else{
 				//console.log("j:"+j);
 				wordFreqArray[j]=arrayObj;
 			}
	 
	 		//console.log(wordFreqArray[j].text+"  "+wordFreqArray[j].size);
	 		j++;
	 	}
 	}
 
 	for(var i=0;i<wordFreqArray.length;i++){
 		console.log(wordFreqArray[i].text+"  "+wordFreqArray[i].size);
 	}
 	
}

/**
** HashMap for the convenience of freq stat and storing raw data
*/
function HashMap()
{
    
    var size = 0;
 
    var entry = new Object();
    
    
    this.put = function (key , value)
    {
        if(!this.containsKey(key))
        {
            size ++ ;
        }
        entry[key] = value;
    }
    
    this.get = function (key)
    {
        return this.containsKey(key) ? entry[key] : null;
    }
    
    this.remove = function ( key )
    {
        if( this.containsKey(key) && ( delete entry[key] ) )
        {
            size --;
        }
    }
    
    this.containsKey = function ( key )
    {
        return (key in entry);
    }
    
    this.containsValue = function ( value )
    {
        for(var prop in entry)
        {
            if(entry[prop] == value)
            {
                return true;
            }
        }
        return false;
    }
    
    this.values = function ()
    {
        var values = new Array();
        for(var prop in entry)
        {
            values.push(entry[prop]);
        }
        return values;
    }
    
    this.keys = function ()
    {
        var keys = new Array();
        for(var prop in entry)
        {
            keys.push(prop);
        }
        return keys;
    }
    
    /** Map Size **/
    this.size = function ()
    {
        return size;
    }
    
    this.clear = function ()
    {
        size = 0;
        entry = new Object();
    }
}

//check if is a number, we remove numbers from the word cloud
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}