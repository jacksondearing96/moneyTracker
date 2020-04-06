function UpdateValueFromDatabase(id, query) {
    var valueRequest = new XMLHttpRequest();
	valueRequest.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			$('#' + id).text(this.responseText);
		}
	};

	valueRequest.open("POST", "../GetValueFromDatabase", true);
	valueRequest.setRequestHeader("content-type", "application/json");
	valueRequest.send(JSON.stringify({'query' : query}));
}

UpdateValueFromDatabase('total-spending', "SELECT SUM(amount) FROM transactions WHERE type='DEBIT'")
UpdateValueFromDatabase('earnings', "SELECT SUM(amount) FROM transactions WHERE type='CREDIT';")