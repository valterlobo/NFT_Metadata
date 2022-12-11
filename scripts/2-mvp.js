const { parse } = require("csv-parse");
const fs = require("fs")

const main = async () => {


    let path_dados = "../dados/"

    console.log("INICIO _____________________________________")

    const certData = require(path_dados + "config.json");
    console.log(certData)

    /************************************** */
    walletMnemonic1 = ethers.Wallet.fromMnemonic(certData.ROLE_01, "m/44'/52752'/0'/0")
    console.log(walletMnemonic1.address)
    walletMnemonic2 = ethers.Wallet.fromMnemonic(certData.ROLE_02, "m/44'/52752'/0'/0")
    console.log(walletMnemonic2.address)

    var url = 'https://alfajores-forno.celo-testnet.org';
    var customHttpProvider = new ethers.providers.JsonRpcProvider(url);
    walletsigner1 = await walletMnemonic1.connect(customHttpProvider)
    //console.log(walletsigner1.provider)
    walletsigner2 = await walletMnemonic2.connect(customHttpProvider)
    //console.log(walletsigner2.provider)



    /////////////////////////////////////////////////////////

    const NFTContractFactory = await hre.ethers.getContractFactory('NFTMetadata');
    const NFTContract = await NFTContractFactory.deploy(certData.name, certData.symbol)
    await NFTContract.deployed();
    console.log("NFTMetadata deployed to:        ", NFTContract.address)
    const PortifolioFactory = await hre.ethers.getContractFactory("PortfolioManagement")
    const PortifolioContract = await PortifolioFactory.deploy([walletMnemonic1.address, walletMnemonic2.address], NFTContract.address, 2);

    await PortifolioContract.deployed();
    console.log("PortfolioManagement deployed to:", PortifolioContract.address)
    NFTContract.transferOwnership(PortifolioContract.address)
    /////////////////////////////////////////////////


    var end = new Promise(function (resolve, reject) {

        const createReadStream = fs.createReadStream(certData.csv, 'utf8')
            .pipe(
                parse({
                    delimiter: ",",
                    columns: true,
                    ltrim: true,
                })
            )
            .on("data", async function (row) {

                console.log("MINT..................");
                console.log(row['Rip Imóvel']);

                let properties = [
                    ["name", "Rip Imóvel:" + row['Rip Imóvel'] + " |  Matrícula:" + row['Matrícula']],
                    ["image", "ipfs://" + "bafybeib66hzee67t5tlhsw3r2jqjyl2izwnhfkicny2ihv3el3q53z52ka" + "/" + "spu_imovel_nft.png"],
                    ["description", row['Endereço'] + "-" + row['Bairro'] + " | " + row['Município'] + "-" + row['UF'] + "- CEP:" + row['CEP']]
                ]


                let attributes = [];
                console.log("---------------------------")
                //console.log(row)
                Object.entries(row).forEach(entry => {
                    const [key, value] = entry;
                    //console.log(key, value);
                    attributes.push(["", key, value, "key", "value", "trait_type"]);
                });



                /*

                const tx = await PortifolioContract.connect(walletsigner1).submitTransaction(
                    PortifolioContract.address,
                    1,
                    properties,
                    attributes
                )
    
                await tx.wait();

    
                const tx1 = await PortifolioContract.connect(walletsigner1).confirmTransaction(0)
    
                const tx2 = await PortifolioContract.connect(walletsigner2).confirmTransaction(0)
    
                const tx3 = await PortifolioContract.connect(walletsigner2).executeTransaction(0)

                console.log(NFTContract.ownerOf(1)) 
                */




            })
            .on("error", function (error) {
                console.log(error.message);
            })
            .on("end", function () {
                console.log("parsed csv data");
            });

        createReadStream.on('finish', () => {
            console.log(`Successfully read a ${certData.csv}.`);

        })
    });

    await (async function () {
        await end;

    }());

    console.log("FIM _____________________________________")
}


const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();