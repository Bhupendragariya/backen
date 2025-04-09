import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema(
    {
        videofile: {
            type: String, //could be a URL or a path to the video file
            required: true
        },
        thumbnail: {
            type: String, //could be a URL
            required: true
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        duration: {
            type: Number, //could be a number 
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        ispublished: {
            type: Boolean,
            default: true
        },
        onwer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
    
        

    },
{
    timestamps: true
})




videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema)