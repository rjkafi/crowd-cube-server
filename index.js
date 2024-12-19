const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.owhyi.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    console.log("Connected to MongoDB");

    const campaignCollection = client.db("campaignDB").collection("campaign");
    const donationsCollection = client.db("campaignDB").collection("donations");

    // Home Route
    app.get("/", (req, res) => {
      res.send("Server is running successfully!");
    });

    // View Campaign from the mongoDB by server || Read/GET Operation
    app.get('/campaign',async(req,res)=>{
      const cursor = campaignCollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    //View speciefic campain Details || READ/GET Operation
    app.get('/campaign/:id', async (req, res) => {
      const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await campaignCollection.findOne(query);
        res.send(result);
       
    });
    // View Or Get DonationData 
    app.get('/mydonations', async (req, res) => {
      const userEmail = req.query.email;
      try {
        const donations = await donationsCollection.find({ userEmail }).toArray();
        res.send(donations);
      } catch (error) {
        console.error("Error fetching donations:", error);
        res.status(500).send({ error: "Failed to fetch donations." });
      }
    });
   
    // Get campaigns created by the logged-in user
    app.get('/campaign', async (req, res) => {
       const userEmail = req.query.email;

     if (!userEmail) {
          return res.status(400).send({ error: "Email query parameter is required." });
     }

    try {
     const userCampaigns = await campaignCollection.find({ userEmail }).toArray();
       res.send(userCampaigns);
   } catch (error) {
    console.error("Error fetching user's campaigns:", error);
    res.status(500).send({ error: "Failed to fetch campaigns." });
  }
});

    
 // View or get campaign to update~~~~~~~~~~~~~~~~~~~~>>>>>
  app.get('/campaign/:id',async(req,res)=>{
  const id=req.params.id;
  const query={_id: new ObjectId(id)}
  const result =await campaignCollection.findOne(query)
    res.send(result)
 })
// Update a specific campaign
  app.put('/campaign/:id', async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updatedCampaign = req.body;
  const campaign = {
    $set: {
      title: updatedCampaign.title,
      minDonation: updatedCampaign.minDonation,
      deadline: updatedCampaign.deadline,
    },
  };
  const result = await campaignCollection.updateOne(filter, campaign, options);
  res.send(result);
  });

 // Delete a specific campaign
   app.delete('/campaign/:id', async (req, res) => {
  const id = req.params.id;

  try {
    const result = await campaignCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount > 0) {
      res.send({ message: "Campaign deleted successfully." });
    } else {
      res.status(404).send({ error: "Campaign not found." });
    }
  } catch (error) {
    console.error("Error deleting campaign with ID:", id, error);
    res.status(500).send({ error: "Failed to delete campaign." });
  }
  });
 
    
    // Post Campaign to the server  || Create Operation
    app.post('/campaign',async(req,res)=>{
      const newCampaign = req.body;
      console.log(newCampaign)
      const result = await campaignCollection.insertOne(newCampaign);
      res.send(result)
    })

    // Post Donation Data to the server || Create Operation
    app.post('/donations', async (req, res) => {
      const donation = req.body;
      try {
        const result = await donationsCollection.insertOne(donation);
        res.send(result);
      } catch (error) {
        console.error("Error saving donation:", error);
        res.status(500).send({ error: "Failed to save donation." });
      }
    });
    

    console.log("Server endpoints ready!");
  } catch (error) {
    console.error("Error:", error);
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is running on PORT: ${port}`);
});
