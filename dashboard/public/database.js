$('table').dataTable({searching: false, paging: false, info: false});

function QueryDatabase(databaseQuery)
{
	var dataTable = $('#dataTable').DataTable();
	dataTable.clear();
	var resultsRequest = new XMLHttpRequest();
	resultsRequest.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			if (this.responseText === "ERROR")
			{
				alert("Error querying database");
				return;
			}
			
			var rows = JSON.parse(this.responseText);
			for (let i = 0; i < rows.length; i++)
			{
				dataTable.row.add( [ 
					rows[i]["id"],
					rows[i]["day"] + "/" + rows[i]["month"] + "/" + rows[i]["year"],
					rows[i]["description"],
					rows[i]["who"],
					rows[i]["type"],
					rows[i]["amount"],
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

QueryDatabase("SELECT * FROM transactions");

function SearchDatabase() 
{
	console.log("Creating search query");
	var databaseQuery = "SELECT * FROM transactions";
	databaseQuery += CurrentSearchCondition();
	console.log("Querying: ", databaseQuery);
	QueryDatabase(databaseQuery);
}

function CurrentSearchCondition()
{
	var databaseQuery = "";
	var databaseCols = [ "id", "day", "month", "year", "description", "who", "type", "amount" ];
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
			
			if (searchTableEntries[i].innerHTML == "NULL")
			{
				databaseQuery += databaseCols[i-1] + " IS null";
			}
			else
			{
				databaseQuery += databaseCols[i-1] + " LIKE '%" + searchTableEntries[i].innerHTML + "%'";
			}
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

			if (searchTableEntries[i].innerHTML == "NULL")
			{
				databaseQuery += databaseCols[i-1] + " IS null";
			}
			else
			{
				databaseQuery += databaseCols[i-1] + "='" + searchTableEntries[i].innerHTML + "'";
			}
			
		}
	}
	return databaseQuery;
}

function CurrentUpdateCondition()
{
	var databaseQuery = "";
	var databaseCols = [ "id", "day", "month", "year", "description", "who", "type", "amount" ];

	var updateTableEntries = document.querySelectorAll("#update-replace td");
	for (let i = 1; i < updateTableEntries.length; i++)
	{
		if (updateTableEntries[i].innerHTML != "")
		{
			var quotation = "'";
			if (databaseCols[i-1] == "id"
			|| databaseCols[i-1] == "day"
			|| databaseCols[i-1] == "month"
			|| databaseCols[i-1] == "year"
			|| databaseCols[i-1] == "amount")
			{
				quotation = "";
			}
			databaseQuery += databaseCols[i-1] + "=" + quotation + updateTableEntries[i].innerHTML + quotation + ",";
		}
	}
	
	if (databaseQuery[databaseQuery.length - 1] == ',')
	{
		databaseQuery = databaseQuery.substr(0, databaseQuery.length - 1);
	}
	return databaseQuery;
}

function Delete()
{
	var dataTable = $('#dataTable').DataTable();
	var numberOfTransactions = dataTable.rows().count();
	var proceed = confirm("Delete " + numberOfTransactions + " transactions?");

	if (proceed === true)
	{
		console.log("Inserting into backup database");
		var databaseQuery = "INSERT INTO removed_transactions SELECT * FROM transactions";
		databaseQuery += CurrentSearchCondition() + ';';
		QueryDatabase(databaseQuery);
		console.log("Deleting from primary database");
		var databaseQuery = "DELETE FROM transactions";
		databaseQuery += CurrentSearchCondition() + ';'
		console.log("Delete Query: ", databaseQuery);
		QueryDatabase(databaseQuery);
		LogQuery(databaseQuery);
		SearchDatabase();
	}
}

function Update()
{
	console.log("Updating database");
	var databaseQuery = "UPDATE transactions SET ";
	databaseQuery += CurrentUpdateCondition();
	databaseQuery += CurrentSearchCondition();
	databaseQuery += ';'
	// Open file and append to it
	// var logFile = open('database_changes.txt', 'a');
	console.log(databaseQuery);
	QueryDatabase(databaseQuery);
	SearchDatabase();
}

function CommitDatabase()
{
	var commitRequest = new XMLHttpRequest();
	commitRequest.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			if (this.responseText === "SUCCESS")
			{
				console.log("Commited database successfully");
			}
			else 
			{
				alert("Error commiting database");
			}
		}
	};

	commitRequest.open("GET", "../CommitDatabase", true);
	commitRequest.setRequestHeader("content-type", "application/json");
	commitRequest.send();
}

function LogQuery(query) {
	var logRequest = new XMLHttpRequest();
	logRequest.onreadystatechange = function() 
	{
		if (this.readyState == 4 && this.status == 200) 
		{
			if (this.responseText === "SUCCESS")
			{
				console.log("Logged database change successfully");
			}
			else 
			{
				alert("Error logging change made to database");
			}
		}
	};

	logRequest.open("POST", "../LogQuery", true);
	logRequest.setRequestHeader("content-type", "application/json");
	logRequest.send(JSON.stringify({'query' : query}));
}