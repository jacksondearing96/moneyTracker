$('table').dataTable({searching: false, paging: false, info: false});

function GetTransactions(databaseQuery)
{
	var dataTable = $('#dataTable').DataTable();
	dataTable.clear();

	var resultsRequest = new XMLHttpRequest();
	resultsRequest.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			var rows = JSON.parse(this.responseText);
			console.log(rows);
			for (let i = 0; i < rows.length; i++)
			{
				dataTable.row.add( [ 
					rows[i]["id"],
					rows[i]["day"] + "/" + rows[i]["month"] + "/" + rows[i]["year"],
					rows[i]["info"],
					rows[i]["description"],
					rows[i]["statement"],
					rows[i]["who"],
					rows[i]["type"],
					rows[i]["amount"],
					rows[i]["category"],
					rows[i]["tag1"],
					rows[i]["tag2"],
				]);
			}
			dataTable.draw();
			var transactionsTitle = document.getElementById("transactions-table-title");
			transactionsTitle.innerText = "Transactions " + "(" + rows.length + ")"
		}
	};

	resultsRequest.open("POST", "../GetTransactions", true);
	resultsRequest.setRequestHeader("content-type", "application/json");
	resultsRequest.send(JSON.stringify({ query : databaseQuery }));
}

GetTransactions("SELECT * FROM transactions");

function CreateSearchQuery() 
{
	console.log("Creating search query");
	
	var databaseQuery = "SELECT * FROM transactions";
	var databaseCols = [ "id", "day", "month", "year", "info", "transactor", "statement", "who", "type", "amount", "category", "tag1", "tag2" ];

	var searchTableEntries = document.querySelectorAll("#contains-matches td");
	var firstCondition = true;
	for (let i = 1; i < searchTableEntries.length; i++)
	{
		if (searchTableEntries[i].innerHTML != "")
		{
			if (firstCondition === true) 
			{
				firstCondition = false;
				databaseQuery += " WHERE ";
			}
			else
			{
				databaseQuery += " AND ";
			}
			databaseQuery += databaseCols[i-1] + " LIKE '%" + searchTableEntries[i].innerHTML + "%'";
		}
	}

	var searchTableEntries = document.querySelectorAll("#exact-matches td");
	for (let i = 1; i < searchTableEntries.length; i++)
	{
		if (searchTableEntries[i].innerHTML != "")
		{
			if (firstCondition === true) 
			{
				firstCondition = false;
				databaseQuery += " WHERE ";
			}
			else
			{
				databaseQuery += " AND ";
			}
			databaseQuery += databaseCols[i-1] + "='" + searchTableEntries[i].innerHTML + "'";
		}
	}
	databaseQuery += ";";
	console.log(databaseQuery);
	GetTransactions(databaseQuery);
}
