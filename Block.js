/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data){
		// Add your Block properties
		// Example: this.hash = "";
		this.hash = '';
		this.height = 0;
		this.time = 0;
		this.body = data;
		this.previousBlockHash = ''; // call method to get last block and grab it's hash value
	}
}

module.exports = {Block};