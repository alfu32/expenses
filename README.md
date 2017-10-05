# expenses
graphical representation for monthly expenses
## Financial Tool
 graphical projection  and aggregation of monthly costs : loans, expenses, future costs.

I am using it to make analytical projections of the impact on the  family budget of loans or other future costs

Taking a mortgage or a loan usually has a heavy impact on your budget, besides ... the banks will offer you capital at different interest rates(fixed, not fixed), different payment schedules (flat or growing) and different loan length. When shopping for a loan with severeal different banks, making an estimation of the impact on your budget (if you can really afford it on a long term ... ) tends to be tricky .

I tried first using excel, graphical projection are limited, one does not have much controll when it comes to aggregating data. 

## specifications :
	can represent scheduled payments of type :
		loan : fixed or variable rate, flat or growing payment schedules
		fixed(monthly) payments 
	the projection is made per month, the payment day taken into account is the last day of the month

## to do
	[ ]variable rate loans : Functional Analisys
	                         UI
	                         implementation
	[ ]bind directly to APIs from banks : feasible or not ?
	                                      APIs

## install
```
git clone https://github.com/alfu32/expenses.git
cd expenses
bower install
```

## http-server
if you want to use the built-in http-server
```
npm install
http-server
```

## user manual

save model       : `ctrl-shit-s`

load saved model : drag the json file from an explorer window and drop it into the page

## license
	(ISC) free to use redistribute modify for any purpose.