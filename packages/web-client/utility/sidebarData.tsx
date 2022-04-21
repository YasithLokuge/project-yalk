import React from 'react'
import HomeIcon from '@mui/icons-material/Home';
import NoteIcon from '@mui/icons-material/Note';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PollIcon from '@mui/icons-material/Poll';
import PieChartIcon from '@mui/icons-material/PieChart';
import { AttachMoneyOutlined } from '@mui/icons-material';

export const SidebarData = [
    {

        title: "Home" ,
        icon: <HomeIcon />,
        link: "/home"

    },
    {

        title: "Usage" ,
        icon: <PollIcon/>,
        link: "/usage"

    },
    {

        title: "Subscription" ,
        icon: <NoteIcon />,
        link: "/subscription"

    },
    {

        title: "Pricing" ,
        icon: <AttachMoneyOutlined />,
        link: "/pricing"

    },
    {

        title: "Trend" ,
        icon: <TrendingUpIcon />,
        link: "/trend"

    },
    {

        title: "Breakdown" ,
        icon: <PieChartIcon />,
        link: "/breakdown"

    }
]