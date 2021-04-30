# challenge-api
>**JS challenge for ALKEMY**

## Notes

### 1) Database:

>Database made with **SQLite 3**

>The following is a compendium of notes that helped build the database model: 

#### Table: Operations

**Columns:**

id INTEGER PRIMARY KEY AUTOINCREMENT,
            CONCEPT text, 
            AMMOUNT number, 
            DATE text (NO HAY DATE PROPIAMENTE DICHO), 
            TYPEID table: OperationsType  

>*TYPEID* refers to the _OperationsType_ table (see below)


#### Table: OperationsTypes

>Should be conected to the _Operations_ table as the *TYPEID* column

**Columns:**

id INTEGER PRIMARY KEY AUTOINCREMENT,
            TYPE: text



