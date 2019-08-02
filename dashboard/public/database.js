
function GetTransactions()
{
	var resultsRequest = new XMLHttpRequest();
	resultsRequest.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			var HTML = this.responseText;
            var transactions_table = document.getElementById("transactions-table");
            transactions_table.innerHTML += HTML;
            $('#dataTable').DataTable();
		}
	};

	resultsRequest.open("GET", "../GetTransactions", true);
	resultsRequest.setRequestHeader("content-type", "application/json");
	resultsRequest.send();
}

GetTransactions();