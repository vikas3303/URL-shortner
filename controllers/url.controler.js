const { nanoid } = require("nanoid");
const URL = require("../models/url.models");

const handleGenerateNewShortURL = async (req, res) => {
    const body = req.body;
    const redirectURL = body.url;
    let ShortURL=null;
    
    if (!redirectURL) return res
        .status(400)
        .redirect(
          `http://localhost:8003/?error=${encodeURIComponent(
            "Original url is required."
          )}`
        );
    // let ShortURL=null;
    // console.log("ShortURL");
    // const existingUrl = await URL.findOne({ redirectURL });
    // if (existingUrl) {
    //     return res.status(200).redirect(
    //         `/?info=${encodeURIComponent(
    //             `This URL is already shortened! Short URL: ${existingUrl.shortId}`
    //         )}`
    //     );
    // }
    if (!body.ShortURL) 
        ShortURL = nanoid(8);
    else {
        const existDoc = await URL.findOne({ shortId: body.ShortURL });
        if (existDoc) {
            return res.status(400).redirect(
                `/?error=${encodeURIComponent(
                    "This path already exists. Please try something else."
                )}`
            );
        }

        ShortURL = body.ShortURL;
    }
    await URL.create({
        shortId: ShortURL,
        redirectURL: redirectURL,
        visitHistory: [],
        createdBy: req.user?._id,
    });
    return res
      .status(201)
      .redirect(
          `/?success=${encodeURIComponent(ShortURL)}`
      );

};

const handleToGetOriginalURL = async (req, res) => {
    const shortId = req.params.shortId;
    const docentry = await URL.findOneAndUpdate(
        { shortId },
        {
            $push: {
                visitHistory: {
                    time: Date.now(),
                },
            },
        }
    );
    if (docentry) return res.redirect(docentry.redirectURL);
    return res.status(400).json({ error: "URL doesn't exist" });
};

const  handleGetAnalytics=async(req, res)=>{
    const shortId = req.params.shortId;
    const result = await URL.findOne({ shortId });
    if (result) {
        return res.json({
            totalClicks: result.visitHistory.length,
            analytics: result.visitHistory,
        });
    }
    return res.status(404).json({ error: "Short URL not found" });

}
module.exports = {
    handleGenerateNewShortURL,
    handleGetAnalytics,
    handleToGetOriginalURL,

};